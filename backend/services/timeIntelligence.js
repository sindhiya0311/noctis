const timeState = {};

function timeIntelligence(userId, isStopped, isNight) {
  if (!timeState[userId]) {
    timeState[userId] = {
      start: Date.now(),
      stopStart: null,
    };
  }

  const state = timeState[userId];
  const now = Date.now();

  let risk = 0;

  // total trip duration
  const tripDuration = (now - state.start) / 1000;

  if (tripDuration > 900) risk += 5; // 15 min
  if (tripDuration > 1800) risk += 8; // 30 min
  if (tripDuration > 3600) risk += 12; // 1 hour

  // stop duration
  if (isStopped) {
    if (!state.stopStart) {
      state.stopStart = now;
    }

    const stopDuration = (now - state.stopStart) / 1000;

    if (stopDuration > 120) risk += 8;
    if (stopDuration > 300) risk += 12;
  } else {
    state.stopStart = null;
  }

  // night amplifier
  if (isNight && tripDuration > 600) {
    risk += 6;
  }

  return risk;
}

module.exports = timeIntelligence;
