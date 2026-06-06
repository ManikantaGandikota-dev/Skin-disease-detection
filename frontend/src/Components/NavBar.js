import React from "react";
import "./NavBar.css";

function Navbar({ setPage }) {
  return (
    <>
    <nav className="navbar">
      <div className="logo">DL APP</div>

      <ul className="nav-links">
        <li onClick={() => setPage("model")}>Model</li>
        <li onClick={() => setPage("about")}>About</li>
      </ul>
    </nav>
    <div className="model-header">
        Skin Detection & Makeup Recommendation
      </div>
    </>
  );
}

export default Navbar;