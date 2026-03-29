import { useState } from "react";
import { Mic } from "lucide-react";

export default function WorkerCodeword() {
  const [word, setWord] = useState(localStorage.getItem("codeword") || "");

  return (
    <div
      className="bg-gradient-to-br from-white/5 to-white/0 
    border border-white/10 rounded-2xl p-6 
    backdrop-blur-xl shadow-2xl"
    >
      <h2 className="text-lg flex gap-2 items-center font-semibold">
        <Mic size={18} />
        Emergency Codeword
      </h2>

      <input
        value={word}
        onChange={(e) => setWord(e.target.value)}
        placeholder="Enter secret emergency word..."
        className="w-full mt-4 p-3 rounded-xl 
      bg-black/40 border border-white/10 
      focus:border-indigo-500 outline-none 
      transition"
      />

      <button
        className="mt-3 bg-gradient-to-r from-indigo-500 to-blue-500 
      px-4 py-2 rounded-xl shadow-lg 
      hover:scale-[1.02] transition-all"
        onClick={() => localStorage.setItem("codeword", word)}
      >
        Save Codeword
      </button>

      <div className="text-xs text-gray-400 mt-3 opacity-70">
        Say this word anytime to trigger SOS automatically
      </div>
    </div>
  );
}
