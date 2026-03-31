const history = {};

function calculateEntropy(userId, speed) {
  if (!history[userId]) {
    history[userId] = [];
  }

  history[userId].push(speed);

  // keep last 5 speeds
  if (history[userId].length > 5) {
    history[userId].shift();
  }

  const speeds = history[userId];

  if (speeds.length < 5) return 0;

  const avg = speeds.reduce((a, b) => a + b, 0) / speeds.length;

  const variance =
    speeds.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / speeds.length;

  // entropy score
  if (variance > 400) return 20;
  if (variance > 200) return 12;
  if (variance > 100) return 6;

  return 0;
}

module.exports = calculateEntropy;
