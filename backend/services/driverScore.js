const drivers = {};

function driverScore(userId, entropy, mlRisk, deviation, stopDuration) {
  if (!drivers[userId]) {
    drivers[userId] = {
      history: [],
    };
  }

  const risk =
    entropy * 2 +
    mlRisk * 0.4 +
    (deviation ? 15 : 0) +
    (stopDuration > 180 ? 10 : 0);

  drivers[userId].history.push(risk);

  if (drivers[userId].history.length > 10) {
    drivers[userId].history.shift();
  }

  const avg =
    drivers[userId].history.reduce((a, b) => a + b, 0) /
    drivers[userId].history.length;

  return Math.min(100, Math.round(avg));
}

module.exports = driverScore;
