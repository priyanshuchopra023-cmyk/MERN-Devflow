import React, { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NAV_SECTIONS = [
  {
    label: "Workspace",
    links: [
      { to: "dashboard", icon: "dashboard", label: "Dashboard" },
      { to: "projects",  icon: "projects",  label: "Projects"  },
    ],
  },
  {
    label: "Manage",
    links: [
      { to: "tasks", icon: "tasks", label: "Tasks"  },
      { to: "docs",  icon: "docs",  label: "Docs"   },
      { to: "repos", icon: "repos", label: "Repos"  },
    ],
  },
];

/* SVG icon set — inline so no extra dependency */
function Icon({ name }) {
  const icons = {
    dashboard: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".85"/>
        <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".45"/>
        <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".45"/>
        <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".85"/>
      </svg>
    ),
    projects: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 4.5A1.5 1.5 0 0 1 3.5 3h3a1.5 1.5 0 0 1 1.5 1.5v1A1.5 1.5 0 0 1 6.5 7h-3A1.5 1.5 0 0 1 2 5.5v-1Z" fill="currentColor"/>
        <rect x="2" y="9" width="12" height="2" rx="1" fill="currentColor" opacity=".55"/>
        <rect x="2" y="12.5" width="8" height="1.5" rx=".75" fill="currentColor" opacity=".35"/>
        <rect x="9" y="3" width="5" height="1.5" rx=".75" fill="currentColor" opacity=".45"/>
        <rect x="10.5" y="5.5" width="3.5" height="1.5" rx=".75" fill="currentColor" opacity=".3"/>
      </svg>
    ),
    tasks: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 4h10M3 8h7M3 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="12.5" cy="11.5" r="2.5" fill="currentColor" opacity=".7"/>
        <path d="M11.5 11.5l.75.75 1.25-1.25" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    docs: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="3" y="1.5" width="10" height="13" rx="1.5" fill="currentColor" opacity=".2" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
    repos: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="4" cy="3.5" r="1.5" fill="currentColor" opacity=".8"/>
        <circle cx="12" cy="3.5" r="1.5" fill="currentColor" opacity=".8"/>
        <circle cx="4" cy="12.5" r="1.5" fill="currentColor" opacity=".8"/>
        <path d="M4 5v5M4 10c0 1.5 1 2 2 2h2.5a1.5 1.5 0 0 0 1.5-1.5V5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  };
  return icons[name] || null;
}

export default function AppShell() {
  const { user } = useAuth();
  const initial  = user?.name?.charAt(0).toUpperCase() || "U";
  const location = useLocation();

  /* active page label for topbar breadcrumb */
  const activePage = NAV_SECTIONS
    .flatMap((s) => s.links)
    .find((l) => location.pathname.includes(l.to))?.label || "Dashboard";

  return (
    <div className="app-shell fade">
      {/* ── Topbar ── */}
      <header className="topbar">
        <div className="topbar-left">
          <div className="topbar-brand">
            <span className="brand-mark">⚡</span>
            DevFlow
          </div>
          <div className="topbar-sep" />
          <span className="topbar-crumb">{activePage}</span>
        </div>

        <div className="topbar-right">
          <button className="topbar-icon-btn" title="Search" aria-label="Search">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </button>
          <button className="topbar-icon-btn" title="Notifications" aria-label="Notifications">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M7.5 2a4 4 0 0 0-4 4v2.5l-1 1.5h10l-1-1.5V6a4 4 0 0 0-4-4Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              <path d="M6 11.5c0 .83.67 1.5 1.5 1.5S9 12.33 9 11.5" stroke="currentColor" strokeWidth="1.3"/>
            </svg>
          </button>
          <div className="topbar-divider" />
          <div className="topbar-user" title={user?.name}>
            {initial}
          </div>
        </div>
      </header>

      <div className="app-body">
        {/* ── Sidebar ── */}
        <aside className="sidebar">
          <nav className="sidebar-nav">
            {NAV_SECTIONS.map((section) => (
              <div key={section.label} className="sidebar-section">
                <div className="sidebar-label">{section.label}</div>
                {section.links.map((l) => (
                  <NavLink
                    key={l.to}
                    to={`/app/${l.to}`}
                    className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
                  >
                    <span className="nav-icon"><Icon name={l.icon} /></span>
                    <span className="nav-label">{l.label}</span>
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

          {/* Sidebar footer — user profile */}
          <div className="sidebar-footer">
            <div className="sidebar-user-card">
              <div className="sidebar-user-avatar">{initial}</div>
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{user?.name}</div>
                <div className="sidebar-user-email">{user?.email}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Page content ── */}
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}