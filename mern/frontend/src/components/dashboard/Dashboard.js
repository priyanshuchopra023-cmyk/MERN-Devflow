import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProjects, getTasks, getDocs, getRepos } from "../../api/api";
import { useAuth } from "../../context/AuthContext";

/* ── Stat card accent configs ── */
const STAT_CONFIG = [
  {
    label: "Projects",
    key: "projects",
    sub: "Active workspaces",
    color: "purple",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="2" width="6" height="7" rx="1.5" fill="currentColor" opacity=".9"/>
        <rect x="10" y="2" width="6" height="4" rx="1.5" fill="currentColor" opacity=".5"/>
        <rect x="2" y="11" width="14" height="1.8" rx=".9" fill="currentColor" opacity=".4"/>
        <rect x="2" y="14.2" width="9" height="1.8" rx=".9" fill="currentColor" opacity=".25"/>
      </svg>
    ),
  },
  {
    label: "Tasks",
    key: "tasks",
    sub: "Across all boards",
    color: "pink",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3.5 5h11M3.5 9h8M3.5 13h5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        <circle cx="14" cy="13" r="3" fill="currentColor" opacity=".7"/>
        <path d="M12.8 13l.9.9 1.5-1.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: "Docs",
    key: "docs",
    sub: "Wiki pages",
    color: "teal",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="3.5" y="1.5" width="11" height="15" rx="2" fill="currentColor" opacity=".18" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M6.5 6h5M6.5 9h5M6.5 12h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "Repos",
    key: "repos",
    sub: "Linked repositories",
    color: "amber",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="4.5" cy="4" r="2" fill="currentColor" opacity=".9"/>
        <circle cx="13.5" cy="4" r="2" fill="currentColor" opacity=".9"/>
        <circle cx="4.5" cy="14" r="2" fill="currentColor" opacity=".9"/>
        <path d="M4.5 6v6M4.5 12c0 1.2 1 2 2.5 2h2.5a2 2 0 0 0 2-2V6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
];

const TASK_ROWS = [
  { label: "To Do",       key: "todo",       colorVar: "--accent-purple", trackVar: "rgba(139,92,246,0.12)" },
  { label: "In Progress", key: "inprogress",  colorVar: "--accent-amber",  trackVar: "rgba(245,158,11,0.12)"  },
  { label: "Done",        key: "done",        colorVar: "--accent-teal",   trackVar: "rgba(20,184,166,0.12)"  },
];

function StatCard({ label, value, sub, color, icon, index }) {
  return (
    <div className={`stat-card ${color}`} style={{ animationDelay: `${index * 0.07}s` }}>
      <div className="stat-card-inner">
        <div className="stat-meta">
          <div className="stat-label">{label}</div>
          <div className={`stat-icon-wrap stat-icon-${color}`}>{icon}</div>
        </div>
        <div className="stat-value">{value}</div>
        <div className="stat-sub">{sub}</div>
      </div>
    </div>
  );
}

function ProgressRow({ label, value, pct, colorVar, trackVar }) {
  return (
    <div className="progress-row">
      <div className="progress-meta">
        <span className="progress-label">{label}</span>
        <span className="progress-count">{value}</span>
      </div>
      <div className="progress-track" style={{ background: trackVar }}>
        <div
          className="progress-fill"
          style={{ width: pct, background: `var(${colorVar})` }}
        />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [stats, setStats] = useState({ projects: 0, tasks: 0, docs: 0, repos: 0 });
  const [taskBreakdown, setTaskBreakdown] = useState({ todo: 0, inprogress: 0, done: 0 });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [pRes, tRes, dRes, rRes] = await Promise.all([
          getProjects(), getTasks(), getDocs(), getRepos(),
        ]);
        const projects = pRes.data;
        const tasks    = tRes.data;
        const docs     = dRes.data;
        const repos    = rRes.data;

        setStats({ projects: projects.length, tasks: tasks.length, docs: docs.length, repos: repos.length });
        setTaskBreakdown({
          todo:       tasks.filter((t) => t.status === "todo").length,
          inprogress: tasks.filter((t) => t.status === "inprogress").length,
          done:       tasks.filter((t) => t.status === "done").length,
        });
        setRecentProjects(projects.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const total = taskBreakdown.todo + taskBreakdown.inprogress + taskBreakdown.done || 1;
  const pct   = (n) => Math.round((n / total) * 100) + "%";

  if (loading) return <div className="spinner" />;

  const hour    = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="dashboard fade">

      {/* ── Page header ── */}
      <div className="page-header">
        <div className="page-header-text">
          <h2>{greeting}, {user?.name} 👋</h2>
          <p>Here's what's happening in your DevFlow workspace today.</p>
        </div>
        <div className="header-actions">
          <button className="action-btn" onClick={() => navigate("/app/projects")}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginRight: 6 }}>
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            New Project
          </button>
        </div>
      </div>

      {/* ── Stats grid ── */}
      <div className="stats-grid">
        {STAT_CONFIG.map((s, i) => (
          <StatCard key={s.key} {...s} value={stats[s.key]} index={i} />
        ))}
      </div>

      {/* ── Bottom grid ── */}
      <div className="dashboard-grid">

        {/* Recent Projects */}
        <div className="section-card">
          <div className="section-header">
            <div className="section-title">Recent Projects</div>
            <button className="section-link" onClick={() => navigate("/app/projects")}>
              View all →
            </button>
          </div>

          <div className="project-list">
            {recentProjects.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📁</div>
                <p>No projects yet.</p>
                <button className="ghost-btn" onClick={() => navigate("/app/projects")}>
                  Create your first project
                </button>
              </div>
            ) : (
              recentProjects.map((p) => (
                <div
                  key={p._id}
                  className="project-row"
                  onClick={() => navigate("/app/tasks")}
                  role="button"
                  tabIndex={0}
                >
                  <div
                    className="project-icon"
                    style={{ background: p.color || "rgba(139,92,246,0.15)" }}
                  >
                    {p.icon || "🚀"}
                  </div>
                  <div className="project-info">
                    <div className="project-name">{p.name}</div>
                    <div className="project-type">{p.type || "Project"}</div>
                  </div>
                  <div className="project-arrow">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              ))
            )}
          </div>

          {recentProjects.length > 0 && (
            <button className="action-btn" onClick={() => navigate("/app/projects")}>
              View All Projects
            </button>
          )}
        </div>

        {/* Task Overview + Quick Actions */}
        <div className="section-card">
          <div className="section-header">
            <div className="section-title">Task Overview</div>
            <button className="section-link" onClick={() => navigate("/app/tasks")}>
              See tasks →
            </button>
          </div>

          <div className="progress-list">
            {TASK_ROWS.map((r) => (
              <ProgressRow
                key={r.key}
                label={r.label}
                value={taskBreakdown[r.key]}
                pct={pct(taskBreakdown[r.key])}
                colorVar={r.colorVar}
                trackVar={r.trackVar}
              />
            ))}
          </div>

          {/* Completion summary */}
          <div className="completion-summary">
            <div className="completion-ring-wrap">
              <svg width="52" height="52" viewBox="0 0 52 52">
                <circle cx="26" cy="26" r="20" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5"/>
                <circle
                  cx="26" cy="26" r="20"
                  fill="none"
                  stroke="url(#doneGrad)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={`${Math.round((taskBreakdown.done / total) * 125.6)} 125.6`}
                  transform="rotate(-90 26 26)"
                />
                <defs>
                  <linearGradient id="doneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#14b8a6"/>
                    <stop offset="100%" stopColor="#6ee7b7"/>
                  </linearGradient>
                </defs>
              </svg>
              <span className="completion-pct">{pct(taskBreakdown.done)}</span>
            </div>
            <div className="completion-text">
              <div className="completion-label">Completion rate</div>
              <div className="completion-sub">{taskBreakdown.done} of {total} tasks done</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <div className="quick-actions-title">Quick Actions</div>
            <div className="quick-actions-row">
              <button className="quick-btn quick-btn-purple" onClick={() => navigate("/app/tasks")}>
                + Task
              </button>
              <button className="quick-btn quick-btn-pink" onClick={() => navigate("/app/docs")}>
                + Doc
              </button>
              <button className="quick-btn quick-btn-teal" onClick={() => navigate("/app/repos")}>
                + Repo
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}