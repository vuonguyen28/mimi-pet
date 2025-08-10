import React from "react";

export default function Navbar() {
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("userChanged"));
    window.location.href = "/login";
  };

  return (
    <header className="app-header">
      <a className="app-sidebar__toggle" href="#" data-toggle="sidebar" aria-label="Hide Sidebar"></a>
      <ul className="app-nav">
        <li>
          <button className="app-nav__item" onClick={handleLogout} style={{ background: "none", border: "none" }}>
            <i className="bx bx-log-out bx-rotate-180"></i>
          </button>
        </li>
      </ul>
    </header>
  );
}