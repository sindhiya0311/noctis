import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "leaflet/dist/leaflet.css";

import { RiskProvider } from "./context/RiskContext";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <RiskProvider>
      <App />
    </RiskProvider>
  </React.StrictMode>,
);

reportWebVitals();
