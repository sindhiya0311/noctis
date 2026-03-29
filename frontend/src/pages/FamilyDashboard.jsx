import { useEffect, useState, useRef, useMemo } from "react";
import socket from "../socket";
import axios from "axios";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

export default function FamilyDashboard() {
  const [worker, setWorker] = useState(null);
  const [alert, setAlert] = useState(false);
  const [requests, setRequests] = useState([]);
  const [linked, setLinked] = useState(false);

  const audioRef = useRef(null);

  // Fix: Memoize user to prevent reference changes triggering loops
  const user = useMemo(() => {
    const userData = sessionStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  }, []);

  const logout = () => {
    sessionStorage.removeItem("user");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  useEffect(() => {
    if (user && user.id) {
      loadRequests();
      checkLinked();
    }
  }, [user]);

  const loadRequests = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/requests/${user.id}`,
      );
      setRequests(res.data.filter((r) => r.type === "family"));
    } catch (err) {
      console.error(err);
    }
  };

  const checkLinked = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/requests/linked/${user.id}`,
      );
      if (res.data.length > 0) setLinked(true);
    } catch (err) {
      console.error(err);
    }
  };

  const acceptRequest = async (id) => {
    await axios.post("http://localhost:5000/api/requests/accept", {
      requestId: id,
    });
    setLinked(true);
    setRequests([]);
  };

  const rejectRequest = async (id) => {
    await axios.post("http://localhost:5000/api/requests/reject", {
      requestId: id,
    });
    loadRequests();
  };

  useEffect(() => {
    socket.on("workers:update", (workers) => {
      const w = Object.values(workers)[0];
      if (w) {
        setWorker(w);
        if (w.risk >= 80) {
          setAlert(true);
          audioRef.current?.play().catch(() => {}); // FIX
        } else {
          setAlert(false);
        }
      }
    });

    socket.on("worker:alert", (w) => {
      setWorker(w);
      setAlert(true);
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

  if (!user)
    return (
      <div className="h-screen bg-[#020617] text-white p-6">
        Loading session...
      </div>
    );

  if (!linked && requests.length > 0) {
    return (
      <div className="h-screen bg-[#020617] text-white p-6">
        <button
          onClick={logout}
          className="absolute top-4 right-4 bg-red-500 px-3 py-1 rounded"
        >
          Logout
        </button>
        <h2 className="text-xl mb-4">Pending Requests</h2>
        {requests.map((r) => (
          <div key={r._id} className="bg-white/5 p-4 rounded-xl mb-3">
            Worker wants to connect
            <button
              onClick={() => acceptRequest(r._id)}
              className="ml-4 bg-blue-500 px-3 py-1 rounded"
            >
              Accept
            </button>
            <button
              onClick={() => rejectRequest(r._id)}
              className="ml-2 bg-red-500 px-3 py-1 rounded"
            >
              Reject
            </button>
          </div>
        ))}
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="h-screen flex items-center justify-center text-white bg-[#020617]">
        <button
          onClick={logout}
          className="absolute top-4 right-4 bg-red-500/20 border border-red-500/40 px-4 py-1.5 rounded-lg hover:bg-red-500/30 transition-all backdrop-blur-xl"
        >
          Logout
        </button>

        <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-2xl">
          <div className="animate-pulse text-gray-300">
            Waiting for worker location...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative bg-[#020617]">
      <button
        onClick={logout}
        className="absolute top-4 right-4 bg-red-500/20 border border-red-500/40 px-4 py-1.5 rounded-lg hover:bg-red-500/30 transition-all backdrop-blur-xl z-[1000]"
      >
        Logout
      </button>

      {alert && (
        <div className="absolute top-0 left-0 w-full bg-gradient-to-r from-red-600 to-red-500 text-white text-center py-3 animate-pulse z-[1000] shadow-lg">
          🚨 EMERGENCY — Worker in Danger
        </div>
      )}

      <MapContainer
        center={[worker.lat, worker.lng]}
        zoom={15}
        className="h-full w-full"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <Marker position={[worker.lat, worker.lng]} icon={getIcon(worker.risk)}>
          <Popup>
            <div className="font-semibold">
              Worker: {worker.name || worker.userId}
            </div>
            Risk: {Math.round(worker.risk)}%
            <br />
            {worker.context}
          </Popup>
        </Marker>
      </MapContainer>

      <div className="absolute top-16 left-6 bg-gradient-to-br from-black/80 to-black/60 backdrop-blur-xl border border-white/10 p-5 rounded-2xl text-white shadow-2xl">
        <div className="text-xs opacity-60 uppercase tracking-wider">
          Live Risk
        </div>

        <div
          className={`text-3xl font-bold mt-1 ${
            worker.risk >= 80
              ? "text-red-400"
              : worker.risk >= 40
                ? "text-yellow-400"
                : "text-green-400"
          }`}
        >
          {Math.round(worker.risk)}%
        </div>

        <div className="text-sm mt-2 opacity-80">{worker.context}</div>
      </div>

      <audio
        ref={audioRef}
        src="https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg"
      />
    </div>
  );
}
