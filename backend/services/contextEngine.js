function getContext({
  speed,
  isNight,
  isStopped,
  deviation,
  unsafeZone,
  stopDuration,
  transport,
  mlRisk,
  entropyRisk,
  driverRisk,
  routeRisk,
  motionRisk,
  timeRisk,
  predictiveBoost,
  trip,
}) {
  // AI anomaly
  if (mlRisk > 80) {
    return "AI detected abnormal behaviour";
  }

  // learned unsafe zone
  if (unsafeZone && isNight) {
    return "Entering unsafe area at night";
  }

  // predictive unsafe zone
  if (predictiveBoost > 0) {
    return "Approaching unsafe zone";
  }

  // route learning
  if (routeRisk > 10) {
    return "Deviation from usual route";
  }

  // motion anomaly
  if (motionRisk > 10) {
    return "Motion anomaly detected";
  }

  // entropy
  if (entropyRisk > 15) {
    return "Abnormal driving pattern";
  }

  // driver suspicious
  if (driverRisk > 75) {
    return "Driver behaviour suspicious";
  }

  // long stop
  if (isStopped && stopDuration > 180) {
    return "Stopped unusually long";
  }

  // night travel
  if (isNight && speed > 5) {
    return "Night travel in progress";
  }

  // moving toward destination
  if (trip?.eta && trip.eta < 10) {
    return "Travelling towards destination";
  }

  return "Travelling normally";
}

module.exports = getContext;
