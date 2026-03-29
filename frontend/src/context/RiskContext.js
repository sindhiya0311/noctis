import { createContext, useState } from "react";

export const RiskContext = createContext();

export function RiskProvider({ children }) {
  const [risk, setRisk] = useState(5);
  const [context, setContext] = useState("Safe");
  const [emergency, setEmergency] = useState(false);

  const triggerManualSOS = () => {
    setEmergency(true);
    setRisk(100);
    setContext("Manual SOS Triggered");
  };

  const triggerCodewordSOS = () => {
    setEmergency(true);
    setRisk(100);
    setContext("Codeword Detected");
  };

  // SAFE setter (prevents overwrite during emergency)
  const updateRisk = (value) => {
    if (!emergency) {
      setRisk(value);
    }
  };

  const updateContext = (text) => {
    if (!emergency) {
      setContext(text);
    }
  };

  const resetEmergency = () => {
    setEmergency(false);
    setRisk(5);
    setContext("Safe");
  };

  const riskLevel = risk >= 80 ? "emergency" : risk >= 40 ? "warning" : "safe";

  return (
    <RiskContext.Provider
      value={{
        risk,
        context,
        riskLevel,
        triggerManualSOS,
        triggerCodewordSOS,
        updateRisk,
        updateContext,
        resetEmergency,
        emergency,
      }}
    >
      {children}
    </RiskContext.Provider>
  );
}
