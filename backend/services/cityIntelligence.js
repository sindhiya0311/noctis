const incidents = [];
const learnedZones = [];

function cityIntelligence(lat, lng, risk) {
  if (risk > 70) {
    incidents.push({
      lat,
      lng,
      time: Date.now(),
    });
  }

  // cluster incidents
  if (incidents.length > 5) {
    const recent = incidents.slice(-5);

    const avgLat = recent.reduce((a, b) => a + b.lat, 0) / recent.length;

    const avgLng = recent.reduce((a, b) => a + b.lng, 0) / recent.length;

    learnedZones.push({
      lat: avgLat,
      lng: avgLng,
    });
  }

  let riskBoost = 0;

  for (const zone of learnedZones) {
    const dist = Math.sqrt(
      Math.pow(zone.lat - lat, 2) + Math.pow(zone.lng - lng, 2),
    );

    if (dist < 0.01) {
      riskBoost = 12;
    }
  }

  return riskBoost;
}

module.exports = cityIntelligence;
