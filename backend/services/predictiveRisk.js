function predictiveRisk({
  baseRisk,
  stopDuration,
  deviation,
  isNight,
  unsafeZone,
}) {
  let risk = baseRisk || 0;

  // stop escalation
  if (stopDuration > 60) risk += 5;
  if (stopDuration > 120) risk += 10;
  if (stopDuration > 180) risk += 15;
  if (stopDuration > 300) risk += 20;

  // deviation escalation
  if (deviation) risk += 10;

  // night amplifier
  if (isNight) risk += 5;

  // unsafe zone amplifier
  if (unsafeZone) risk += 15;

  // clamp
  if (risk > 100) risk = 100;

  return risk;
}

module.exports = predictiveRisk;
