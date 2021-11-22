import React from "react";

import { NavContainer } from "./components/NavContainer";

import "./styles/App.css";

function App() {
  return (
    <div className="appBody">
      <header className="appHeader">
        <div className="title">
          <h3>Homepage Navigation</h3>
        </div>
        <div className="actionButtons">
          <div className="status">
            <p>Saved</p>
          </div>
          <button className="previewButton" type="button">
            Preview
          </button>
        </div>
      </header>
      <NavContainer />
    </div>
  );
}

export default App;
