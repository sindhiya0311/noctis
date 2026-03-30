import { useState, useEffect } from "react";
import { MapPin, Plus, Trash, Edit } from "lucide-react";

export default function WorkerSavedLocations({ setSavingLocation }) {
  const [locations, setLocations] = useState([]);
  const [name, setName] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    load();

    const reload = () => load();
    window.addEventListener("savedLocationsUpdated", reload);

    return () => window.removeEventListener("savedLocationsUpdated", reload);
  }, []);

  const getKey = () => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    return `savedLocations_${user?._id || user?.id}`;
  };

  const load = () => {
    const saved = JSON.parse(localStorage.getItem(getKey())) || [];
    setLocations(saved);
  };

  const addLocation = () => {
    if (!name) return;
    setSavingLocation(name);
    setName("");
  };

  const deleteLocation = (i) => {
    const updated = [...locations];
    updated.splice(i, 1);

    localStorage.setItem(getKey(), JSON.stringify(updated));
    setLocations(updated);
  };

  const editLocation = (i) => {
    setEditingIndex(i);
    setName(locations[i].name);
  };

  const saveEdit = () => {
    const updated = [...locations];
    updated[editingIndex].name = name;

    localStorage.setItem(getKey(), JSON.stringify(updated));
    setLocations(updated);

    setEditingIndex(null);
    setName("");
  };

  return (
    <div
      className="bg-gradient-to-br from-white/5 to-white/0 
  border border-white/10 rounded-2xl p-6 
  backdrop-blur-xl shadow-2xl"
    >
      <h2 className="text-lg mb-4 flex gap-2 items-center font-semibold">
        <MapPin size={18} />
        Saved Locations
      </h2>

      <div className="flex gap-2 mb-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Home / Office"
          className="flex-1 p-2 rounded-xl bg-black/40 
        border border-white/10 
        focus:border-blue-500 outline-none 
        transition"
        />

        {editingIndex !== null ? (
          <button
            onClick={saveEdit}
            className="bg-gradient-to-r from-green-500 to-emerald-500 
          px-4 rounded-xl shadow-lg hover:scale-[1.02] transition"
          >
            Save
          </button>
        ) : (
          <button
            onClick={addLocation}
            className="bg-gradient-to-r from-indigo-500 to-blue-500 
          px-4 rounded-xl flex gap-1 items-center 
          shadow-lg hover:scale-[1.02] transition"
          >
            <Plus size={14} />
            Add
          </button>
        )}
      </div>

      {locations.map((loc, i) => (
        <div
          key={i}
          className="bg-gradient-to-br from-white/5 to-white/0 
        border border-white/10 
        p-3 rounded-xl mb-2 
        flex justify-between items-center 
        hover:border-blue-500/30 transition shadow-lg"
        >
          <div>
            <div className="font-medium">{loc.name}</div>

            {loc.lat && (
              <div className="text-xs text-gray-400">
                {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Edit
              size={16}
              onClick={() => editLocation(i)}
              className="cursor-pointer text-blue-400 hover:scale-110 transition"
            />
            <Trash
              size={16}
              onClick={() => deleteLocation(i)}
              className="cursor-pointer text-red-400 hover:scale-110 transition"
            />
          </div>
        </div>
      ))}

      <div className="text-xs text-gray-400 mt-4 opacity-70">
        Add → then click map to set coordinates
      </div>
    </div>
  );
}
