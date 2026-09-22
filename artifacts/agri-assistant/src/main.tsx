import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Auto-reload on stale dynamic import chunks after new deployments or builds
window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  window.location.reload();
});

createRoot(document.getElementById("root")!).render(<App />);
