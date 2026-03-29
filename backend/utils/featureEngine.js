const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // meters
  const toRad = (x) => (x * Math.PI) / 180;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // meters
};

exports.generateFeatures = (prev, current) => {
  let distanceMoved = 0;
  let timeGap = 0;
  let movementChange = 0;

  if (prev) {
    distanceMoved = haversineDistance(
      prev.latitude,
      prev.longitude,
      current.latitude,
      current.longitude,
    );

    timeGap = (new Date(current.timestamp) - new Date(prev.timestamp)) / 1000;

    movementChange = Math.abs(current.speed - prev.speed);
  }

  const hour = new Date(current.timestamp).getHours();
  const isNight = hour >= 22 || hour <= 4 ? 1 : 0;

  const isStopped = current.speed < 5 && distanceMoved < 10 ? 1 : 0;

  return {
    isNight,
    distanceMoved,
    timeGap,
    isStopped,
    movementChange,
  };
};
