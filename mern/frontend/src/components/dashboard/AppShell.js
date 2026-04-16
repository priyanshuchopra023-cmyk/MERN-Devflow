import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AppShell() {
  const { user } = useAuth();
  const initial = user?.name?.charAt(0).toUpperCase() || "U";

  const navLinks = [
    { to: "dashboard", icon: "🏠", label: "Dashboard" },
    { to: "projects",  icon: "📁", label: "Projects"  },
    { to: "tasks",     icon: "✅", label: "Tasks"     },
    { to: "docs",      icon: "📄", label: "Docs"      },
    { to: "repos",     icon: "🔗", label: "Repos"     },
  ];

  return (
    <div className="app-shell fade">
      {/* ── Topbar ── */}
      <div className="topbar">
        <div className="topbar-brand">⚡ DevFlow <span>A-J Solutions</span></div>
        <div className="topbar-user" title={user?.name}>{initial}</div>
      </div>

      <div className="app-body">
        {/* ── Sidebar ── */}
        <div className="sidebar">
          <div className="sidebar-label">Workspace</div>
          {navLinks.slice(0, 2).map((l) => (
            <NavLink
              key={l.to}
              to={`/app/${l.to}`}
              className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
            >
              <span className="nav-icon">{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
          <div className="sidebar-label">Manage</div>
          {navLinks.slice(2).map((l) => (
            <NavLink
              key={l.to}
              to={`/app/${l.to}`}
              className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
            >
              <span className="nav-icon">{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
          <div style={{ marginTop: "auto", borderTop: "1px solid #f0edf7", paddingTop: 16 }}>
            <div style={{ padding: "10px 10px", borderRadius: 10, background: "#f8f5ff" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#2d1b6e" }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: "#9d88bb", marginTop: 2 }}>{user?.email}</div>
            </div>
          </div>
        </div>

        {/* ── Page content ── */}
        <div className="main-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
