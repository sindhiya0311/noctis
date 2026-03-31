const memory = {};

function riskMemory(userId, risk) {
  if (!memory[userId]) {
    memory[userId] = {
      value: risk,
    };
  }

  const prev = memory[userId].value;

  // slow decay
  let newRisk = Math.max(risk, prev * 0.85);

  // clamp
  if (newRisk > 100) newRisk = 100;

  memory[userId].value = newRisk;

  return Math.round(newRisk);
}

module.exports = riskMemory;
