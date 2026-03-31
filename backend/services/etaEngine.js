const trips = {};

function calculateETA(userId, lat, lon, speed, destination) {
  if (!destination) return null;

  const R = 6371;

  const dLat = ((destination.lat - lat) * Math.PI) / 180;
  const dLon = ((destination.lng - lon) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat * Math.PI) / 180) *
      Math.cos((destination.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;

  if (speed < 5) return null;

  const etaHours = distance / speed;
  const etaMinutes = Math.round(etaHours * 60);

  return etaMinutes;
}

function updateTrip(userId, lat, lon, speed, destination) {
  if (!trips[userId]) {
    trips[userId] = {
      started: true,
      status: "Trip started",
    };
  }

  const eta = calculateETA(userId, lat, lon, speed, destination);

  if (eta !== null) {
    trips[userId].eta = eta;
    trips[userId].status = "In transit";
  }

  if (eta !== null && eta <= 1) {
    trips[userId].status = "Reached safely";
  }

  return trips[userId];
}

module.exports = updateTrip;
