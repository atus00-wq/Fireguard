import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set viewport to prevent zooming on mobile
const meta = document.createElement('meta');
meta.name = 'viewport';
meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
document.getElementsByTagName('head')[0].appendChild(meta);

// Set page title
const title = document.createElement('title');
title.textContent = 'FireGuard AI - Fire Detection';
document.getElementsByTagName('head')[0].appendChild(title);

createRoot(document.getElementById("root")!).render(<App />);
