import React, { useEffect, useState } from "react";
import { getDocs, createDoc, updateDoc, deleteDoc, getProjects } from "../../api/api";
import { useToast } from "../../context/ToastContext";
import Modal from "../common/Modal";

const DOC_EMOJIS = ["📘","📗","📙","📕","📓","📃","📑","🗒️"];

export default function Docs() {
  const showToast = useToast();
  const [docs, setDocs]         = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editModal, setEditModal]   = useState(false);
  const [saving, setSaving]         = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [editingDoc, setEditingDoc] = useState(null);
  const [form, setForm] = useState({ title: "", content: "", project: "" });

  const fetchData = async () => {
    try {
      const [dRes, pRes] = await Promise.all([getDocs(selectedProject || undefined), getProjects()]);
      setDocs(dRes.data);
      setProjects(pRes.data);
      if (!form.project && pRes.data.length > 0) setForm((f) => ({ ...f, project: pRes.data[0]._id }));
    } catch { showToast("Failed to load docs"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [selectedProject]);

  const handleCreate = async () => {
    if (!form.title.trim()) { showToast("Title is required"); return; }
    if (!form.project)      { showToast("Select a project"); return; }
    setSaving(true);
    try {
      await createDoc(form);
      showToast("Doc created ✅");
      setShowModal(false);
      setForm({ title: "", content: "", project: projects[0]?._id || "" });
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to create doc");
    } finally { setSaving(false); }
  };

  const handleEdit = (doc) => {
    setEditingDoc(doc);
    setForm({ title: doc.title, content: doc.content, project: doc.project });
    setEditModal(true);
  };

  const handleUpdate = async () => {
    if (!form.title.trim()) { showToast("Title is required"); return; }
    setSaving(true);
    try {
      await updateDoc(editingDoc._id, { title: form.title, content: form.content });
      showToast("Doc updated ✅");
      setEditModal(false);
      fetchData();
    } catch { showToast("Failed to update doc"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this document?")) return;
    try {
      await deleteDoc(id);
      setDocs(docs.filter((d) => d._id !== id));
      showToast("Doc deleted");
    } catch { showToast("Failed to delete doc"); }
  };

  const timeAgo = (iso) => {
    const diff = Date.now() - new Date(iso);
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  if (loading) return <div className="spinner" />;

  return (
    <div className="fade">
      <div className="page-header">
        <div className="page-header-text">
          <h2>Docs</h2>
          <p>Your Confluence-style knowledge base.</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {projects.length > 0 && (
            <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}
              style={{ padding: "8px 14px", borderRadius: 10, border: "1.5px solid #e0d8f0", fontFamily: "Poppins", fontSize: 13, color: "#333" }}>
              <option value="">All Projects</option>
              {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          )}
          <button className="action-btn" onClick={() => setShowModal(true)}>+ New Doc</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
        {docs.map((doc, i) => (
          <div key={doc._id} onClick={() => handleEdit(doc)} style={{
            background: "white", borderRadius: 14, padding: 20, border: "1px solid #e8e4f0",
            cursor: "pointer", transition: "box-shadow 0.2s", position: "relative",
          }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 6px 24px rgba(106,17,203,0.1)"}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
          >
            <button onClick={(e) => handleDelete(doc._id, e)} style={{
              position: "absolute", top: 12, right: 12, background: "none", border: "none",
              fontSize: 16, cursor: "pointer", color: "#ddd",
            }}
              onMouseEnter={(e) => e.target.style.color = "#ff6b6b"}
              onMouseLeave={(e) => e.target.style.color = "#ddd"}
            >✕</button>
            <div style={{ fontSize: 28, marginBottom: 10 }}>{DOC_EMOJIS[i % DOC_EMOJIS.length]}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#2d1b6e", marginBottom: 6 }}>{doc.title}</div>
            <div style={{ fontSize: 12, color: "#9d88bb", lineHeight: 1.5 }}>
              {doc.content ? doc.content.slice(0, 80) + (doc.content.length > 80 ? "..." : "") : "No content yet."}
            </div>
            <div style={{ fontSize: 11, color: "#c0b0d8", marginTop: 12 }}>Updated {timeAgo(doc.updatedAt)}</div>
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
          <span style={{ fontSize: 13, fontWeight: 500 }}>New Document</span>
        </div>
      </div>

      {/* Create modal */}
      {showModal && (
        <Modal title="Create New Doc" onClose={() => setShowModal(false)} onSubmit={handleCreate} loading={saving}>
          <input placeholder="Document title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <select value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })}>
            <option value="">Select Project *</option>
            {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
          <textarea placeholder="Write your content here..." value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} style={{ minHeight: 120 }} />
        </Modal>
      )}

      {/* Edit modal */}
      {editModal && (
        <Modal title="Edit Document" onClose={() => setEditModal(false)} onSubmit={handleUpdate} loading={saving}>
          <input placeholder="Document title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea placeholder="Content..." value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} style={{ minHeight: 140 }} />
        </Modal>
      )}
    </div>
  );
}
