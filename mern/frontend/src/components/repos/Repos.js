import React, { useEffect, useState } from "react";
import { getRepos, createRepo, deleteRepo, getProjects } from "../../api/api";
import { useToast } from "../../context/ToastContext";
import Modal from "../common/Modal";

const LANG_BADGE = {
  React: "badge-purple", "Node.js": "badge-teal", Python: "badge-green",
  "HTML/CSS": "badge-amber", "React Native": "badge-pink", Other: "badge-purple",
};

export default function Repos() {
  const showToast = useToast();
  const [repos, setRepos]       = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [form, setForm] = useState({ name: "", link: "", language: "", project: "" });

  const fetchData = async () => {
    try {
      const [rRes, pRes] = await Promise.all([getRepos(selectedProject || undefined), getProjects()]);
      setRepos(rRes.data);
      setProjects(pRes.data);
      if (!form.project && pRes.data.length > 0) setForm((f) => ({ ...f, project: pRes.data[0]._id }));
    } catch { showToast("Failed to load repos"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [selectedProject]);

  const handleCreate = async () => {
    if (!form.name.trim() || !form.link.trim()) { showToast("Name and link are required"); return; }
    if (!form.project) { showToast("Select a project"); return; }
    setSaving(true);
    try {
      await createRepo(form);
      showToast("Repo linked ✅");
      setShowModal(false);
      setForm({ name: "", link: "", language: "", project: projects[0]?._id || "" });
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to add repo");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this repo?")) return;
    try {
      await deleteRepo(id);
      setRepos(repos.filter((r) => r._id !== id));
      showToast("Repo removed");
    } catch { showToast("Failed to remove repo"); }
  };

  if (loading) return <div className="spinner" />;

  return (
    <div className="fade">
      <div className="page-header">
        <div className="page-header-text">
          <h2>Repositories</h2>
          <p>All linked GitHub repositories for your projects.</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {projects.length > 0 && (
            <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}
              style={{ padding: "8px 14px", borderRadius: 10, border: "1.5px solid #e0d8f0", fontFamily: "Poppins", fontSize: 13, color: "#333" }}>
              <option value="">All Projects</option>
              {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          )}
          <button className="action-btn" onClick={() => setShowModal(true)}>+ Add Repo</button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {repos.map((repo) => (
          <div key={repo._id} style={{
            background: "white", borderRadius: 14, padding: "18px 20px", border: "1px solid #e8e4f0",
            display: "flex", alignItems: "center", gap: 16, transition: "box-shadow 0.15s",
          }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 16px rgba(106,17,203,0.08)"}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
          >
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#f3eeff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
              🐙
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#2d1b6e", marginBottom: 3 }}>{repo.name}</div>
              <a href={repo.link} target="_blank" rel="noreferrer"
                style={{ fontSize: 12, color: "#9d50bb", textDecoration: "none" }}
                onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
                onMouseLeave={(e) => e.target.style.textDecoration = "none"}
              >{repo.link}</a>
            </div>
            <span className={`badge ${LANG_BADGE[repo.language] || "badge-purple"}`}>{repo.language || "Other"}</span>
            <button onClick={() => handleDelete(repo._id)}
              style={{ fontSize: 18, cursor: "pointer", color: "#ddd", background: "none", border: "none" }}
              onMouseEnter={(e) => e.target.style.color = "#ff6b6b"}
              onMouseLeave={(e) => e.target.style.color = "#ddd"}
            >✕</button>
          </div>
        ))}

        {repos.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: "#b0a0cc", fontSize: 14 }}>
            No repos linked yet.<br />
            <span style={{ color: "#9d50bb", cursor: "pointer", fontWeight: 500 }} onClick={() => setShowModal(true)}>Link your first repo →</span>
          </div>
        )}

        {/* Add row */}
        <div onClick={() => setShowModal(true)} style={{
          background: "rgba(106,17,203,0.03)", borderRadius: 14, padding: "18px 20px",
          border: "2px dashed #c9b8e8", cursor: "pointer", display: "flex",
          alignItems: "center", justifyContent: "center", gap: 8,
          color: "#9d50bb", fontSize: 13, fontWeight: 500, transition: "background 0.2s",
        }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(106,17,203,0.07)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(106,17,203,0.03)"}
        >
          <span style={{ fontSize: 18 }}>+</span> Link a Repository
        </div>
      </div>

      {showModal && (
        <Modal title="Link Repository" onClose={() => setShowModal(false)} onSubmit={handleCreate} loading={saving}>
          <input placeholder="Repository name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="GitHub URL * (https://github.com/...)" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
          <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
            <option value="">Language / Stack</option>
            <option>React</option><option>Node.js</option><option>Python</option>
            <option>HTML/CSS</option><option>React Native</option><option>Other</option>
          </select>
          <select value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })}>
            <option value="">Select Project *</option>
            {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        </Modal>
      )}
    </div>
  );
}
