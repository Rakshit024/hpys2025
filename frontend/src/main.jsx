import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css"; // ✅ Import global styles
import App from "./App.jsx";
import "./index.css"

console.log("main.jsx: App is rendering");

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
