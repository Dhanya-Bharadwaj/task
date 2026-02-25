/**
 * src/main.tsx
 * BPV App entry point.
 */
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "./styles/index.css";

import { Toaster } from "react-hot-toast";
import { UIProvider } from "./context/UIProvider";
import { AuthProvider } from "./context/AuthProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <UIProvider>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { marginTop: "60px" },
          }}
        />
      </AuthProvider>
    </UIProvider>
  </React.StrictMode>
);
