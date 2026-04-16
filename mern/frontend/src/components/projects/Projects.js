import React, { useEffect, useState } from "react";
import { getProjects, createProject, deleteProject } from "../../api/api";
import { useToast } from "../../context/ToastContext";
import Modal from "../common/Modal";

const ICONS  = ["🚀","🌐","📱","🎯","🔧","⚡","🛠️","🎨","💡","🔬"];
const COLORS = ["#f3eeff","#e0fdf4","#fffbeb","#fff0f0","#e0f0ff","#fce7f3","#f0fdf4","#fef3c7"];

export default function Projects() {
  const showToast = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [form, setForm] = useState({ name: "", description: "", type: "", icon: "🚀", color: "#f3eeff" });

  const fetchProjects = async () => {
    try {
      const res = await getProjects();
      setProjects(res.data);
    } catch (err) {
      showToast("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) { showToast("Project name is required"); return; }
    setSaving(true);
    try {
      await createProject(form);
      showToast("Project created ✅");
      setShowModal(false);
      setForm({ name: "", description: "", type: "", icon: "🚀", color: "#f3eeff" });
      fetchProjects();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to create project");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this project?")) return;
    try {
      await deleteProject(id);
      setProjects(projects.filter((p) => p._id !== id));
      showToast("Project deleted");
    } catch {
      showToast("Failed to delete project");
    }
  };

  if (loading) return <div className="spinner" />;

  return (
    <div className="fade">
      <div className="page-header">
        <div className="page-header-text">
          <h2>Projects</h2>
          <p>All your development workspaces in one place.</p>
        </div>
        <button className="action-btn" onClick={() => setShowModal(true)}>+ New Project</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
        {projects.map((p) => (
          <div key={p._id} style={{
            background: "white", borderRadius: 14, padding: 20, border: "1px solid #e8e4f0",
            cursor: "pointer", transition: "box-shadow 0.2s, transform 0.15s", position: "relative",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 6px 24px rgba(106,17,203,0.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
          >
            <button onClick={(e) => handleDelete(p._id, e)} style={{
              position: "absolute", top: 12, right: 12, background: "none", border: "none",
              fontSize: 16, cursor: "pointer", color: "#ddd", lineHeight: 1,
            }}
              onMouseEnter={(e) => e.target.style.color = "#ff6b6b"}
              onMouseLeave={(e) => e.target.style.color = "#ddd"}
            >✕</button>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: p.color || "#f3eeff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 12 }}>
              {p.icon || "🚀"}
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#2d1b6e", marginBottom: 4 }}>{p.name}</div>
            <div style={{ fontSize: 12, color: "#9d88bb" }}>{p.description || "No description"}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
              <span className="badge badge-purple">{p.type || "Project"}</span>
            </div>
          </div>
        ))}

        {/* Add card */}
        <div onClick={() => setShowModal(true)} style={{
          background: "rgba(106,17,203,0.03)", borderRadius: 14, padding: 20,
          border: "2px dashed #c9b8e8", cursor: "pointer", display: "flex",
          alignItems: "center", justifyContent: "center", flexDirection: "column",
          gap: 8, minHeight: 150, color: "#9d50bb", transition: "background 0.2s",
        }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(106,17,203,0.07)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(106,17,203,0.03)"}
        >
          <div style={{ fontSize: 28, fontWeight: 300 }}>+</div>
          <span style={{ fontSize: 13, fontWeight: 500 }}>New Project</span>
        </div>
      </div>

      {showModal && (
        <Modal title="Create New Project" onClose={() => setShowModal(false)} onSubmit={handleCreate} loading={saving}>
          <input placeholder="Project name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Short description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="">Project Type</option>
            <option>Web App</option><option>Mobile App</option><option>API</option><option>Other</option>
          </select>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>Pick an icon:</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {ICONS.map((ic) => (
                <button key={ic} type="button" onClick={() => setForm({ ...form, icon: ic })}
                  style={{ fontSize: 20, padding: "4px 8px", borderRadius: 8, border: form.icon === ic ? "2px solid #9d50bb" : "1.5px solid #e0d8f0", cursor: "pointer", background: "white" }}>
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>Card color:</div>
            <div style={{ display: "flex", gap: 8 }}>
              {COLORS.map((c) => (
                <div key={c} onClick={() => setForm({ ...form, color: c })}
                  style={{ width: 28, height: 28, borderRadius: 6, background: c, cursor: "pointer", border: form.color === c ? "2px solid #6a11cb" : "1.5px solid #e0d8f0" }} />
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
