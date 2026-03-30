import { motion } from "framer-motion";
import { AlertTriangle, Shield, Siren, Radar } from "lucide-react";
import { getUserStorage, setUserStorage } from "../utils/storage";
import { useContext, useState, useEffect, useRef, useMemo } from "react";
import { RiskContext } from "../context/RiskContext";

import MapView from "../components/MapView";
import WorkerSavedLocations from "./WorkerSavedLocations";
import WorkerHeatmap from "./WorkerHeatmap";
import WorkerCodeword from "./WorkerCodeword";
import CodewordModal from "../components/CodewordModal";

import axios from "axios";
import socket from "../socket";
export default function WorkerDashboard() {
  const { risk, context, riskLevel, triggerManualSOS, triggerCodewordSOS } =
    useContext(RiskContext);

  const user = useMemo(() => {
    const userData = sessionStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  }, []);

  const logout = () => {
    sessionStorage.removeItem("user");
    window.location.href = "/";
  };

  const [page, setPage] = useState("dashboard");
  const [openCodeword, setOpenCodeword] = useState(false);
  const [savingLocation, setSavingLocation] = useState(null);
  const [requests, setRequests] = useState([]);

  const [transportType, setTransportType] = useState("personal");
  const [cabNumber, setCabNumber] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");

  const [familyEmail, setFamilyEmail] = useState("");
  const [familyMsg, setFamilyMsg] = useState("");

  const recognitionRef = useRef(null);

  /* -------------------- FIXED: CODEWORD DETECTION -------------------- */
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition || !user) return;

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let isStarted = false;

    recognition.onstart = () => {
      isStarted = true;
      console.log("Voice monitoring active...");
    };

    recognition.onend = () => {
      isStarted = false;
      // Faster auto-restart logic
      setTimeout(() => {
        if (!isStarted) {
          try {
            recognition.start();
          } catch (err) {
            console.error("Failed to restart recognition:", err);
          }
        }
      }, 300);
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed") {
        console.error("Microphone permission denied.");
      }
      isStarted = false;
    };

    recognition.onresult = (event) => {
      // FIX: Ensure key matches WorkerCodeword.jsx (using _id or id consistently)
      const storageKey = `codeword_${user?._id || user?.id}`;
      const savedWord = localStorage.getItem(storageKey);

      if (!savedWord) return;
      const codeword = savedWord.toLowerCase().trim();

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.toLowerCase();

        // Immediate check on interim or final results for high speed
        if (transcript.includes(codeword)) {
          console.log("!!! CODEWORD MATCHED !!!", codeword);

          triggerCodewordSOS();

          // 🔥 ADD THIS LINE
          socket.emit("worker:sos", {
            userId: user?._id || user?.id,
          });

          recognition.stop();
          break;
        }
      }
    };

    try {
      recognition.start();
    } catch (err) {
      console.error("Initial start failed:", err);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
    };
  }, [triggerCodewordSOS, user]);
  /* -------------------------------------------------------------- */

  useEffect(() => {
    if (user && (user.id || user._id)) loadRequests();

    const storageKey = `codeword_${user?._id || user?.id}`;
    const word = localStorage.getItem(storageKey);
    if (!word) setOpenCodeword(true);
  }, [user]);

  const loadRequests = async () => {
    if (!user) return;
    const userId = user._id || user.id;
    const res = await axios.get(`http://localhost:5000/api/requests/${userId}`);
    setRequests(res.data.filter((r) => r.type === "enterprise"));
  };

  const acceptRequest = async (id) => {
    await axios.post("http://localhost:5000/api/requests/accept", {
      requestId: id,
    });
    loadRequests();
  };

  const rejectRequest = async (id) => {
    await axios.post("http://localhost:5000/api/requests/reject", {
      requestId: id,
    });
    loadRequests();
  };

  const sendFamilyRequest = async () => {
    if (!user) return;
    const userId = user._id || user.id;
    try {
      await axios.post("http://localhost:5000/api/requests/send", {
        fromUser: userId,
        email: familyEmail,
        type: "family",
      });

      setFamilyMsg(`Request sent to ${familyEmail}`);
      setFamilyEmail("");
    } catch {
      setFamilyMsg("User not found");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#020617] text-white p-10">
        Redirecting...
      </div>
    );
  }

  const riskColor =
    riskLevel === "emergency"
      ? "text-red-400"
      : riskLevel === "warning"
        ? "text-yellow-400"
        : "text-green-400";

  return (
    <div className="min-h-screen bg-[#020617] text-white flex">
      {/* SIDEBAR */}
      <div className="w-64 bg-gradient-to-b from-[#020617] to-[#030a1a] backdrop-blur-xl border-r border-white/10 p-6 shadow-2xl">
        <h1 className="text-xl font-semibold mb-8 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          NOCTIS
        </h1>

        <div className="space-y-2 text-sm cursor-pointer">
          {[
            ["dashboard", "Dashboard"],
            ["locations", "Saved Locations"],
            ["heatmap", "Heatmap"],
            ["codeword", "Codeword"],
            ["transport", "Transport"],
            ["family", "Add Family"],
            ["requests", "Enterprise Requests"],
          ].map(([key, label]) => (
            <div
              key={key}
              onClick={() => setPage(key)}
              className={`px-3 py-2 rounded-lg transition-all duration-200
            ${
              page === key
                ? "bg-blue-500/20 text-blue-400 shadow-lg"
                : "hover:bg-white/5 text-gray-300"
            }`}
            >
              {label}
            </div>
          ))}

          <div
            onClick={triggerManualSOS}
            className="px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
          >
            Emergency
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 p-6">
        {page === "dashboard" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between mb-6">
              <h2 className="text-xl font-semibold">Worker Dashboard</h2>

              <div className="flex gap-3">
                <button
                  onClick={logout}
                  className="bg-red-500/20 border border-red-500/40 px-3 py-1 rounded hover:bg-red-500/30 transition"
                >
                  Logout
                </button>

                <motion.div
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs flex items-center gap-2"
                >
                  <Radar size={14} />
                  Live Monitoring Active
                </motion.div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-8 bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-2xl p-4 h-[420px] shadow-2xl backdrop-blur-xl">
                <MapView
                  savingLocation={savingLocation}
                  setSavingLocation={setSavingLocation}
                  transportType={transportType}
                  cabNumber={cabNumber}
                  driverName={driverName}
                  driverPhone={driverPhone}
                />
              </div>

              <div className="col-span-4 space-y-6">
                <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 p-4 rounded-2xl shadow-xl">
                  <AlertTriangle size={18} />
                  <motion.div
                    key={risk}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`text-3xl font-bold ${riskColor}`}
                  >
                    {Math.round(risk)}%
                  </motion.div>
                </div>

                <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 p-4 rounded-2xl shadow-xl">
                  <Shield size={18} />
                  <div>{context}</div>
                </div>

                <button
                  onClick={() => {
                    triggerManualSOS();

                    socket.emit("worker:sos", {
                      userId: user?._id || user?.id,
                    });
                  }}
                  className="bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/40 rounded-2xl p-4 flex gap-2 w-full justify-center hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-red-500/20"
                >
                  <Siren size={18} />
                  Emergency SOS
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {page === "transport" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 p-6 rounded-2xl w-[400px] shadow-xl"
          >
            <h2 className="text-lg mb-4">Transport Details</h2>

            <select
              value={transportType}
              onChange={(e) => setTransportType(e.target.value)}
              className="w-full p-2 bg-black/40 rounded mb-3"
            >
              <option value="personal">Personal Vehicle</option>
              <option value="office">Office Cab</option>
              <option value="public">Public Transport</option>
              <option value="walk">Walking</option>
            </select>

            {transportType === "office" && (
              <>
                <input
                  placeholder="Cab Number"
                  value={cabNumber}
                  onChange={(e) => setCabNumber(e.target.value)}
                  className="w-full p-2 bg-black/40 rounded mb-2"
                />

                <input
                  placeholder="Driver Name"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full p-2 bg-black/40 rounded mb-2"
                />

                <input
                  placeholder="Driver Phone"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  className="w-full p-2 bg-black/40 rounded"
                />
              </>
            )}
          </motion.div>
        )}

        {page === "family" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 p-6 rounded-2xl w-96 shadow-xl"
          >
            <h2>Add Family</h2>

            <input
              value={familyEmail}
              onChange={(e) => setFamilyEmail(e.target.value)}
              className="w-full p-2 bg-black/40 rounded my-3"
              placeholder="Family Member Email"
            />

            <button
              onClick={sendFamilyRequest}
              className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-600 transition"
            >
              Send
            </button>

            {familyMsg && <div className="mt-2 text-sm">{familyMsg}</div>}
          </motion.div>
        )}

        {page === "requests" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 p-6 rounded-2xl shadow-xl"
          >
            <h2>Enterprise Requests</h2>

            {requests.length === 0 ? (
              <p className="text-gray-400 mt-2">No pending requests.</p>
            ) : (
              requests.map((r) => (
                <div
                  key={r._id}
                  className="mt-3 p-3 bg-white/5 rounded flex items-center justify-between"
                >
                  <span>Enterprise wants to track you</span>
                  <div>
                    <button
                      onClick={() => acceptRequest(r._id)}
                      className="ml-3 bg-blue-500 px-2 py-1 rounded"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => rejectRequest(r._id)}
                      className="ml-2 bg-red-500 px-2 py-1 rounded"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {page === "locations" && (
          <WorkerSavedLocations setSavingLocation={setSavingLocation} />
        )}

        {page === "heatmap" && <WorkerHeatmap />}
        {page === "codeword" && <WorkerCodeword />}
      </div>

      <CodewordModal
        open={openCodeword}
        onClose={() => setOpenCodeword(false)}
      />
    </div>
  );
}
