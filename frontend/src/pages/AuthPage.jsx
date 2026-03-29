import { useState } from "react";
import axios from "axios";

export default function AuthPage() {
  const [mode, setMode] = useState("login");

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "worker",
    name: "",
  });

  const handleSubmit = async () => {
    try {
      if (mode === "signup") {
        await axios.post("http://localhost:5000/api/users/signup", form);
        alert("Account created. Please login.");
        setMode("login");
      } else {
        const res = await axios.post(
          "http://localhost:5000/api/users/login",
          form,
        );

        const user = res.data;

        // ✅ changed only this line
        sessionStorage.setItem("user", JSON.stringify(user));

        // role routing
        if (user.role === "worker") {
          window.location.href = "/worker";
        }

        if (user.role === "family") {
          window.location.href = "/family";
        }

        if (user.role === "enterprise") {
          window.location.href = "/enterprise";
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#020617] text-white relative overflow-hidden">
      {/* background glow */}
      <div className="absolute w-[600px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full -top-40 -left-40" />
      <div className="absolute w-[600px] h-[600px] bg-purple-500/10 blur-[120px] rounded-full -bottom-40 -right-40" />

      <div
        className="relative bg-gradient-to-br from-white/5 to-white/0 
      border border-white/10 backdrop-blur-xl 
      p-8 rounded-2xl w-96 space-y-4 shadow-2xl"
      >
        <h2
          className="text-2xl font-semibold text-center 
      bg-gradient-to-r from-blue-400 to-cyan-400 
      bg-clip-text text-transparent"
        >
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h2>

        {mode === "signup" && (
          <input
            placeholder="Name"
            className="w-full p-2.5 bg-black/40 rounded-lg 
          border border-white/10 
          focus:border-blue-500 outline-none transition"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        )}

        <input
          placeholder="Email"
          className="w-full p-2.5 bg-black/40 rounded-lg 
        border border-white/10 
        focus:border-blue-500 outline-none transition"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2.5 bg-black/40 rounded-lg 
        border border-white/10 
        focus:border-blue-500 outline-none transition"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        {mode === "signup" && (
          <select
            className="w-full p-2.5 bg-black/40 rounded-lg 
          border border-white/10 
          focus:border-blue-500 outline-none transition"
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="worker">Worker</option>
            <option value="family">Family</option>
            <option value="enterprise">Enterprise</option>
          </select>
        )}

        <button
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 
        p-2.5 rounded-lg shadow-lg 
        hover:scale-[1.02] transition-all"
        >
          {mode === "login" ? "Login" : "Signup"}
        </button>

        <div
          className="text-sm cursor-pointer opacity-70 text-center 
        hover:opacity-100 transition"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          {mode === "login" ? "Create account" : "Already have account? Login"}
        </div>
      </div>
    </div>
  );
}
