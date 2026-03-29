export function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;

  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function checkRouteDeviation(current, start, end) {
  if (!start || !end) return false;

  const d1 = getDistance(current.lat, current.lng, start.lat, start.lng);

  const d2 = getDistance(current.lat, current.lng, end.lat, end.lng);

  const routeLength = getDistance(start.lat, start.lng, end.lat, end.lng);

  const deviation = Math.abs(d1 + d2 - routeLength);

  // tolerance (meters)
  const THRESHOLD = 120;

  return deviation > THRESHOLD;
}
