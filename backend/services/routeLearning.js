const routes = {};

function routeLearning(userId, lat, lng) {
  if (!routes[userId]) {
    routes[userId] = [];
  }

  const userRoute = routes[userId];

  userRoute.push({ lat, lng });

  if (userRoute.length > 50) {
    userRoute.shift();
  }

  if (userRoute.length < 10) return 0;

  let deviationScore = 0;

  for (const point of userRoute) {
    const dist = Math.sqrt(
      Math.pow(point.lat - lat, 2) + Math.pow(point.lng - lng, 2),
    );

    if (dist > 0.01) {
      deviationScore++;
    }
  }

  if (deviationScore > 20) {
    return 15;
  }

  if (deviationScore > 10) {
    return 8;
  }

  return 0;
}

module.exports = routeLearning;
