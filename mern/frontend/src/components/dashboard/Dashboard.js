import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProjects, getTasks, getDocs, getRepos } from "../../api/api";
import { useAuth } from "../../context/AuthContext";

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

  return (
    <div className="fade">
      <div className="page-header">
        <div className="page-header-text">
          <h2>Welcome back, {user?.name} 👋</h2>
          <p>Here's what's happening in your DevFlow workspace today.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { label: "Projects", value: stats.projects, sub: "Active workspaces",    color: "purple" },
          { label: "Tasks",    value: stats.tasks,    sub: "Across all boards",    color: "pink"   },
          { label: "Docs",     value: stats.docs,     sub: "Wiki pages",           color: "teal"   },
          { label: "Repos",    value: stats.repos,    sub: "Linked repositories",  color: "amber"  },
        ].map((s) => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Bottom grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Recent Projects */}
        <div className="section-card">
          <div className="section-title">Recent Projects</div>
          {recentProjects.length === 0 ? (
            <p style={{ fontSize: 13, color: "#b0a0cc" }}>No projects yet. <span style={{ color: "#9d50bb", cursor: "pointer" }} onClick={() => navigate("/app/projects")}>Create one →</span></p>
          ) : (
            recentProjects.map((p) => (
              <div key={p._id} onClick={() => navigate("/app/tasks")}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #f5f0ff", cursor: "pointer" }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: p.color || "#f3eeff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                  {p.icon || "🚀"}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#2d1b6e" }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: "#9d88bb" }}>{p.type || "Project"}</div>
                </div>
              </div>
            ))
          )}
          <button className="action-btn" style={{ marginTop: 16, width: "100%" }} onClick={() => navigate("/app/projects")}>
            View All Projects
          </button>
        </div>

        {/* Task Breakdown */}
        <div className="section-card">
          <div className="section-title">Task Overview</div>
          {[
            { label: "Todo",        key: "todo",        color: "linear-gradient(90deg,#9d50bb,#6a11cb)", bg: "#f3eeff" },
            { label: "In Progress", key: "inprogress",  color: "linear-gradient(90deg,#f59e0b,#fbbf24)", bg: "#fffbeb" },
            { label: "Done",        key: "done",        color: "linear-gradient(90deg,#10b981,#34d399)", bg: "#f0fdf4" },
          ].map((r) => (
            <div key={r.key} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 12, color: "#9d88bb", width: 76 }}>{r.label}</span>
              <div style={{ flex: 1, height: 8, background: r.bg, borderRadius: 8, overflow: "hidden" }}>
                <div style={{ width: pct(taskBreakdown[r.key]), height: "100%", background: r.color, borderRadius: 8, transition: "width 0.6s ease" }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#2d1b6e", width: 20 }}>{taskBreakdown[r.key]}</span>
            </div>
          ))}

          <div style={{ borderTop: "1px solid #f0edf7", paddingTop: 16, marginTop: 4 }}>
            <div className="section-title" style={{ marginBottom: 10 }}>Quick Actions</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span className="badge badge-purple" style={{ cursor: "pointer", padding: "6px 14px" }} onClick={() => navigate("/app/tasks")}>+ New Task</span>
              <span className="badge badge-pink"   style={{ cursor: "pointer", padding: "6px 14px" }} onClick={() => navigate("/app/docs")}>+ New Doc</span>
              <span className="badge badge-teal"   style={{ cursor: "pointer", padding: "6px 14px" }} onClick={() => navigate("/app/repos")}>+ Add Repo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
