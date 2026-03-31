const history = {};

function behaviorLearning(userId, speed, isStopped) {
  if (!history[userId]) {
    history[userId] = {
      speeds: [],
      stops: 0,
    };
  }

  const user = history[userId];

  // learn speed
  user.speeds.push(speed);

  if (user.speeds.length > 20) {
    user.speeds.shift();
  }

  const avgSpeed = user.speeds.reduce((a, b) => a + b, 0) / user.speeds.length;

  let risk = 0;

  // unusual slow movement
  if (speed < avgSpeed * 0.3 && avgSpeed > 10) {
    risk += 10;
  }

  // unusual fast movement
  if (speed > avgSpeed * 2) {
    risk += 10;
  }

  // abnormal stopping
  if (isStopped) {
    user.stops++;
  } else {
    user.stops = 0;
  }

  if (user.stops > 5) {
    risk += 10;
  }

  return risk;
}

module.exports = behaviorLearning;
