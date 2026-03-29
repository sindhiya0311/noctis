import { Activity } from "lucide-react";

export default function WorkerHeatmap() {
  return (
    <div
      className="bg-gradient-to-br from-white/5 to-white/0 
    border border-white/10 rounded-2xl p-6 
    backdrop-blur-xl shadow-2xl"
    >
      <h2 className="text-lg flex gap-2 items-center font-semibold">
        <Activity size={18} />
        Danger Heatmap
      </h2>

      <p className="text-gray-400 mt-3 opacity-80">
        Heatmap visible on map. Toggle from sidebar.
      </p>

      <div className="mt-4 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="mt-4 text-xs text-gray-500">
        AI analyzes unsafe zones based on worker movement patterns.
      </div>
    </div>
  );
}
