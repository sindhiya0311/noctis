import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";

import socket from "../socket";
import { useState, useEffect, useContext } from "react";
import L from "leaflet";

import { RiskContext } from "../context/RiskContext";
import { checkRouteDeviation, getDistance } from "../utils/routeDeviation";

import {
  isNightTime,
  calculateSpeed,
  checkUnsafeZone,
} from "../utils/riskEngine";

function Recenter({ position }) {
  const map = useMap();
  map.setView(position);
  return null;
}

function MapClick({ savingLocation, setSavingLocation }) {
  useMapEvents({
    click(e) {
      if (!savingLocation) return;

      const saved = JSON.parse(localStorage.getItem("savedLocations")) || [];

      saved.push({
        name: savingLocation,
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });

      localStorage.setItem("savedLocations", JSON.stringify(saved));
      setSavingLocation(null);
    },
  });

  return null;
}

export default function MapView({
  savingLocation,
  setSavingLocation,
  transportType,
  cabNumber,
  driverName,
  driverPhone,
}) {
  const { risk, context, updateRisk, updateContext, emergency } =
    useContext(RiskContext);

  const [position, setPosition] = useState([12.9716, 80.2345]);

  const [lastPosition, setLastPosition] = useState(null);
  const [lastMoveTime, setLastMoveTime] = useState(Date.now());
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  const user = JSON.parse(sessionStorage.getItem("user")) || {};
  const workerName = user.name || user.username || "Worker";
  const userId = user?._id || "worker-1";
  const enterpriseId = "enterprise-1";

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition((pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      setPosition([lat, lng]);

      const current = { lat, lng };
      const now = Date.now();

      let newRisk = 5;
      let newContext = "Safe";

      let stop = 0;
      let night = 0;
      let unsafe = 0;
      let deviationFlag = 0;

      if (lastPosition) {
        const dist = getDistance(
          current.lat,
          current.lng,
          lastPosition.lat,
          lastPosition.lng,
        );

        if (dist < 20) {
          const stopped = now - lastMoveTime;

          if (stopped > 60000) {
            stop = 1;
            newRisk = 60;
            newContext = "Worker stationary";
          }
        } else {
          setLastMoveTime(now);
        }
      }

      const speed = calculateSpeed(lastPosition, current, now - lastUpdate);

      if (isNightTime()) night = 1;

      if (checkUnsafeZone(lat, lng)) {
        unsafe = 1;
        newRisk = 80;
        newContext = "Entered unsafe zone";
      }

      const saved = JSON.parse(localStorage.getItem("savedLocations")) || [];

      const home = saved.find((l) => l.name === "Home");
      const office = saved.find((l) => l.name === "Office");

      if (home && office) {
        const deviation = checkRouteDeviation(
          current,
          { lat: home.lat, lng: home.lng },
          { lat: office.lat, lng: office.lng },
        );

        if (deviation > 600) {
          deviationFlag = 1;
          newRisk = 85;
          newContext = "Route deviation detected";
        }
      }

      if (!emergency) {
        updateRisk(newRisk);
        updateContext(newContext);
      }

      socket.emit("worker:update", {
        userId: user._id,
        name: workerName,
        lat,
        lng,
        speed,
        stop,
        night,
        unsafe,
        deviation: deviationFlag,
        risk: emergency ? 100 : newRisk,
        context: emergency ? "EMERGENCY SOS TRIGGERED" : newContext,
        transportType,
        cabNumber,
        driverName,
        driverPhone,
        timestamp: Date.now(),
      });

      setLastPosition(current);
      setLastUpdate(now);
    });

    return () => navigator.geolocation.clearWatch(watchId);
  }, [
    lastPosition,
    lastMoveTime,
    lastUpdate,
    emergency,
    transportType,
    cabNumber,
    driverName,
    driverPhone,
  ]);

  let marker =
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png";

  if (risk > 80)
    marker =
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png";
  else if (risk > 40)
    marker =
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png";

  const icon = new L.Icon({
    iconUrl: marker,
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  return (
    <MapContainer
      center={position}
      zoom={15}
      className="h-full w-full rounded-xl"
    >
      <Recenter position={position} />

      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <Marker position={position} icon={icon}>
        <Popup>
          Risk: {Math.round(risk)}% <br />
          {context}
        </Popup>
      </Marker>

      <MapClick
        savingLocation={savingLocation}
        setSavingLocation={setSavingLocation}
      />
    </MapContainer>
  );
}
