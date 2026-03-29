export function isNightTime() {
  const hour = new Date().getHours();
  return hour >= 22 || hour <= 5;
}

export function calculateSpeed(prev, current, timeDiff) {
  if (!prev) return 0;

  const R = 6371e3;

  const φ1 = (prev.lat * Math.PI) / 180;
  const φ2 = (current.lat * Math.PI) / 180;

  const Δφ = ((current.lat - prev.lat) * Math.PI) / 180;
  const Δλ = ((current.lng - prev.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;

  return distance / (timeDiff / 1000);
}

export function checkUnsafeZone(lat, lng) {
  const zones = [
    { lat: 12.9716, lng: 80.235, radius: 500 },
    { lat: 12.9725, lng: 80.233, radius: 400 },
  ];

  for (let z of zones) {
    const dx = lat - z.lat;
    const dy = lng - z.lng;

    const dist = Math.sqrt(dx * dx + dy * dy) * 111000;

    if (dist < z.radius) return true;
  }

  return false;
}
