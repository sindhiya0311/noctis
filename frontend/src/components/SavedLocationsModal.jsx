import { useState, useEffect } from "react";
import { MapPin, Plus, Trash, Edit, Check } from "lucide-react";

export default function WorkerSavedLocations({ setSavingLocation }) {
  const [locations, setLocations] = useState([]);
  const [newName, setNewName] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [isPicking, setIsPicking] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = () => {
    const saved = JSON.parse(localStorage.getItem("savedLocations")) || [];
    setLocations(saved);
  };

  // ADD NEW
  const addLocation = () => {
    if (!newName) return;

    setSavingLocation({
      name: newName,
      editingIndex: null,
    });

    setIsPicking(true);
    setNewName("");
  };

  // DELETE
  const deleteLocation = (index) => {
    const updated = [...locations];
    updated.splice(index, 1);

    localStorage.setItem("savedLocations", JSON.stringify(updated));
    setLocations(updated);
  };

  // EDIT
  const editLocation = (index) => {
    setEditingIndex(index);
    setNewName(locations[index].name);
  };

  // SAVE EDIT NAME
  const saveEdit = () => {
    const updated = [...locations];
    updated[editingIndex].name = newName;

    localStorage.setItem("savedLocations", JSON.stringify(updated));
    setLocations(updated);

    setEditingIndex(null);
    setNewName("");
  };

  // RESET LOCATION (pick again)
  const resetLocation = (index) => {
    setSavingLocation({
      name: locations[index].name,
      editingIndex: index,
    });

    setIsPicking(true);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <h2 className="text-lg mb-4 flex gap-2 items-center">
        <MapPin size={18} />
        Saved Locations
      </h2>

      {/* add */}
      <div className="flex gap-2 mb-4">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Home / Office / Friend"
          className="flex-1 p-2 rounded-xl bg-white/5 border border-white/10"
        />

        {editingIndex !== null ? (
          <button
            onClick={saveEdit}
            className="bg-green-600 px-3 rounded-xl flex items-center gap-1"
          >
            <Check size={14} />
            Save
          </button>
        ) : (
          <button
            onClick={addLocation}
            className="bg-indigo-600 px-3 rounded-xl flex items-center gap-1"
          >
            <Plus size={14} />
            Add
          </button>
        )}
      </div>

      {/* list */}
      {locations.map((loc, i) => (
        <div
          key={i}
          className="bg-white/5 p-3 rounded-xl mb-2 flex justify-between items-center"
        >
          <div>
            <div className="font-medium">{loc.name}</div>

            {loc.lat ? (
              <div className="text-xs text-gray-400">
                {loc.lat.toFixed(5)} , {loc.lng.toFixed(5)}
              </div>
            ) : (
              <div className="text-xs text-yellow-400">
                Location not set — click edit pin
              </div>
            )}
          </div>

          <div className="flex gap-3 items-center">
            {/* reset location */}
            <MapPin
              size={16}
              className="cursor-pointer text-indigo-400"
              onClick={() => resetLocation(i)}
            />

            {/* edit name */}
            <Edit
              size={16}
              className="cursor-pointer"
              onClick={() => editLocation(i)}
            />

            {/* delete */}
            <Trash
              size={16}
              className="cursor-pointer text-red-400"
              onClick={() => deleteLocation(i)}
            />
          </div>
        </div>
      ))}

      <div className="text-xs text-gray-400 mt-4">
        Add → then click map to save location
      </div>
    </div>
  );
}
