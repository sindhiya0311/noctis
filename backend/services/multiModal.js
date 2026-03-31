const motionHistory = {};

function multiModal(userId, speed, acceleration) {
  if (!motionHistory[userId]) {
    motionHistory[userId] = [];
  }

  const history = motionHistory[userId];

  history.push({
    speed,
    acceleration,
    time: Date.now(),
  });

  if (history.length > 10) {
    history.shift();
  }

  let risk = 0;

  // sudden acceleration
  if (Math.abs(acceleration) > 8) {
    risk += 10;
  }

  // fall detection (sudden drop in speed)
  if (history.length > 2) {
    const prev = history[history.length - 2];

    if (prev.speed > 20 && speed < 2) {
      risk += 15;
    }
  }

  // shake detection
  if (history.length > 5) {
    let changes = 0;

    for (let i = 1; i < history.length; i++) {
      if (Math.abs(history[i].speed - history[i - 1].speed) > 15) {
        changes++;
      }
    }

    if (changes > 3) {
      risk += 12;
    }
  }

  return risk;
}

module.exports = multiModal;
