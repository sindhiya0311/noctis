function predictiveSafety({ lat, lng, unsafeZones = [], speed }) {
  if (!unsafeZones.length) return 0;

  const R = 6371;

  for (const zone of unsafeZones) {
    const dLat = ((zone.lat - lat) * Math.PI) / 180;
    const dLon = ((zone.lng - lng) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat * Math.PI) / 180) *
        Math.cos((zone.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;

    // within 300m
    if (distance < 0.3) {
      return 15;
    }

    // approaching 800m
    if (distance < 0.8) {
      return 8;
    }
  }

  return 0;
}

module.exports = predictiveSafety;
