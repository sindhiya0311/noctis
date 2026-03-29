import { useState } from "react";
import { motion } from "framer-motion";

export default function CodewordModal({ open, onClose }) {
  const [word, setWord] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#020617] border border-white/10 rounded-2xl p-6 w-[400px]"
      >
        <h2 className="text-lg mb-4">Set Emergency Codeword</h2>

        <input
          placeholder="Enter secret word"
          className="w-full p-3 rounded-xl bg-white/5 border border-white/10 mb-4"
          onChange={(e) => setWord(e.target.value)}
        />

        <div className="flex justify-end gap-3">
          <button className="text-gray-400" onClick={onClose}>
            Cancel
          </button>

          <button
            className="bg-indigo-600 px-4 py-2 rounded-xl"
            onClick={() => {
              localStorage.setItem("codeword", word.toLowerCase());
              onClose();
            }}
          >
            Save
          </button>
        </div>
      </motion.div>
    </div>
  );
}
