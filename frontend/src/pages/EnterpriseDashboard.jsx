import { useEffect, useState, useRef, useMemo } from "react";
import socket from "../socket";
import axios from "axios";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

function Recenter({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 15);
  }, [position, map]);
  return null;
}

export default function EnterpriseDashboard() {
  const [workers, setWorkers] = useState({});
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [alerts, setAlerts] = useState([]);

  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [activeTab, setActiveTab] = useState("workers"); // Default to workers

  const audioRef = useRef(null);

  const user = useMemo(() => {
    const userData = sessionStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  }, []);

  const logout = () => {
    sessionStorage.removeItem("user");
    window.location.href = "/";
  };

  const sendRequest = async () => {
    if (!user) return;
    try {
      await axios.post("http://localhost:5000/api/requests/send", {
        fromUser: user.id,
        email,
        type: "enterprise",
      });
      setMsg(`Request sent to ${email}`);
      setEmail("");
    } catch {
      setMsg("User not found");
    }
  };

  useEffect(() => {
    socket.off("workers:update");
    socket.off("worker:alert");

    socket.on("workers:update", (data) => {
      setWorkers(data);
    });

    socket.on("worker:alert", (data) => {
      setAlerts((prev) => [data, ...prev.slice(0, 4)]);
      audioRef.current?.play().catch(() => {}); // FIX
    });

    return () => {
      socket.off("workers:update");
      socket.off("worker:alert");
    };
  }, []);

  const getIcon = (risk) => {
    let marker =
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png";
    if (risk > 80)
      marker =
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png";
    else if (risk > 40)
      marker =
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png";

    return new L.Icon({
      iconUrl: marker,
      shadowUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });
  };

  const workerList = Object.values(workers);
  const cabList = workerList.filter((w) => w.transportType === "office");

  if (!user)
    return (
      <div className="h-screen bg-[#020617] text-white p-6">Loading...</div>
    );

  return (
    <div className="h-screen flex bg-[#020617] text-white">
      <button
        onClick={logout}
        className="absolute top-4 right-4 bg-red-500/20 border border-red-500/40 px-4 py-1.5 rounded-lg hover:bg-red-500/30 transition-all backdrop-blur-xl z-[9999]"
      >
        Logout
      </button>

      {/* SIDEBAR */}
      <div className="w-80 bg-gradient-to-b from-[#020617] to-[#030a1a] backdrop-blur-xl border-r border-white/10 p-4 overflow-y-auto shadow-2xl">
        <div className="mb-6">
          <div className="text-lg mb-2 font-semibold">Add Worker</div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="worker email"
            className="w-full p-2 bg-black/40 rounded-lg mb-2 border border-white/10"
          />
          <button
            onClick={sendRequest}
            className="bg-blue-500 px-3 py-1.5 rounded-lg w-full hover:bg-blue-600 transition"
          >
            Send Request
          </button>
          {msg && <div className="text-xs mt-2 opacity-70">{msg}</div>}
        </div>

        <div className="mb-4 space-y-2">
          <div
            className={`p-2 rounded-lg cursor-pointer transition ${
              activeTab === "workers"
                ? "bg-blue-500/20 text-blue-400"
                : "bg-black/40 hover:bg-white/10"
            }`}
            onClick={() => setActiveTab("workers")}
          >
            Workers
          </div>
          <div
            className={`p-2 rounded-lg cursor-pointer transition ${
              activeTab === "cabs"
                ? "bg-blue-500/20 text-blue-400"
                : "bg-black/40 hover:bg-white/10"
            }`}
            onClick={() => setActiveTab("cabs")}
          >
            Office Cabs
          </div>
        </div>

        {activeTab === "workers" && (
          <div className="mb-6">
            <div className="text-lg mb-2 font-semibold">Active Staff</div>
            {workerList.length === 0 && (
              <div className="text-xs opacity-50">No workers online</div>
            )}

            {workerList.map((w) => (
              <div
                key={w.name || w.userId}
                onClick={() => setSelectedWorker(w)}
                className="p-3 rounded-xl mb-2 cursor-pointer bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-blue-500/30 transition shadow-lg"
              >
                <div className="flex justify-between">
                  <span className="font-medium">{w.name || w.userId}</span>

                  <span>
                    {w.risk >= 80 ? "🔴" : w.risk >= 40 ? "🟡" : "🟢"}
                  </span>
                </div>

                <div className="text-xs opacity-70 mt-1">
                  Risk: {Math.round(w.risk)}%
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "cabs" && (
          <div>
            <div className="text-lg mb-2 font-semibold">Office Cabs</div>
            {cabList.length === 0 && (
              <div className="text-xs opacity-50">No cabs active</div>
            )}

            {cabList.map((w) => (
              <div
                key={w.name || w.userId}
                className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 p-3 rounded-xl mb-2 shadow-lg"
              >
                <div className="font-medium">Worker: {w.name || w.userId}</div>

                <div className="text-xs opacity-70 mt-1">
                  Cab: {w.cabNumber}
                </div>

                <div className="text-xs opacity-70">Driver: {w.driverName}</div>

                <div className="text-xs opacity-70">Phone: {w.driverPhone}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MAP */}
      <div className="flex-1 relative">
        <MapContainer
          center={[12.9716, 80.2345]}
          zoom={13}
          className="h-full w-full"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <Recenter
            position={
              selectedWorker ? [selectedWorker.lat, selectedWorker.lng] : null
            }
          />

          {workerList.map((worker) => (
            <Marker
              key={worker.userId}
              position={[worker.lat, worker.lng]}
              icon={getIcon(worker.risk)}
            >
              <Popup>
                <div className="font-semibold">
                  Worker: {worker.name || worker.userId}
                </div>
                Risk: {Math.round(worker.risk)}%
                <br />
                {worker.context}
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <audio
          ref={audioRef}
          src="https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg"
        />
      </div>
    </div>
  );
}
