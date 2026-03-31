function getRiskLevel(risk) {
  if (risk >= 80) {
    return {
      level: "EMERGENCY",
      color: "red",
    };
  }

  if (risk >= 60) {
    return {
      level: "WARNING",
      color: "orange",
    };
  }

  if (risk >= 30) {
    return {
      level: "ALERT",
      color: "yellow",
    };
  }

  return {
    level: "SAFE",
    color: "green",
  };
}

module.exports = getRiskLevel;
