import React from "react";
import ISSView from "./components/ISSView";
import "./App.css";

function App() {
  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      {/* 3D ISS View */}
      <ISSView />
    </div>
  );
}

export default App;
