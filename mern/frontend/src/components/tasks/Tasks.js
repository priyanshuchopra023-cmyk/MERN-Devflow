import React, { useEffect, useState } from "react";
import { getTasks, createTask, updateTaskStatus, deleteTask, getProjects } from "../../api/api";
import { useToast } from "../../context/ToastContext";
import Modal from "../common/Modal";

const COLUMNS = [
  { key: "todo",       label: "📋 Todo",        countClass: "badge-purple", titleColor: "#9d50bb"  },
  { key: "inprogress", label: "⚙️ In Progress",  countClass: "badge-amber",  titleColor: "#f59e0b"  },
  { key: "done",       label: "✅ Done",         countClass: "badge-green",  titleColor: "#10b981"  },
];

const NEXT = { todo: "inprogress", inprogress: "done" };
const NEXT_LABEL = { todo: "→ In Progress", inprogress: "→ Done" };

export default function Tasks() {
  const showToast = useToast();
  const [tasks, setTasks]       = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [form, setForm] = useState({ title: "", status: "todo", project: "" });

  const fetchData = async () => {
    try {
      const [tRes, pRes] = await Promise.all([getTasks(selectedProject || undefined), getProjects()]);
      setTasks(tRes.data);
      setProjects(pRes.data);
      if (!form.project && pRes.data.length > 0) setForm((f) => ({ ...f, project: pRes.data[0]._id }));
    } catch { showToast("Failed to load tasks"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [selectedProject]);

  const handleCreate = async () => {
    if (!form.title.trim()) { showToast("Task title is required"); return; }
    if (!form.project)      { showToast("Select a project"); return; }
    setSaving(true);
    try {
      await createTask(form);
      showToast("Task added ✅");
      setShowModal(false);
      setForm({ title: "", status: "todo", project: projects[0]?._id || "" });
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to create task");
    } finally { setSaving(false); }
  };

  const handleMove = async (task) => {
    const next = NEXT[task.status];
    if (!next) return;
    try {
      await updateTaskStatus(task._id, next);
      setTasks(tasks.map((t) => t._id === task._id ? { ...t, status: next } : t));
      showToast(`Task moved to ${next === "inprogress" ? "In Progress" : "Done"} ✅`);
    } catch { showToast("Failed to update task"); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      setTasks(tasks.filter((t) => t._id !== id));
      showToast("Task deleted");
    } catch { showToast("Failed to delete"); }
  };

  const colTasks = (key) => tasks.filter((t) => t.status === key);

  if (loading) return <div className="spinner" />;

  return (
    <div className="fade">
      <div className="page-header">
        <div className="page-header-text">
          <h2>Task Board</h2>
          <p>Move tasks across columns to update their status.</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {projects.length > 0 && (
            <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}
              style={{ padding: "8px 14px", borderRadius: 10, border: "1.5px solid #e0d8f0", fontFamily: "Poppins", fontSize: 13, color: "#333", cursor: "pointer" }}>
              <option value="">All Projects</option>
              {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          )}
          <button className="action-btn" onClick={() => setShowModal(true)}>+ Add Task</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {COLUMNS.map((col) => (
          <div key={col.key} style={{ background: "#f8f4ff", borderRadius: 14, padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: col.titleColor }}>{col.label}</span>
              <span className={`badge ${col.countClass}`}>{colTasks(col.key).length}</span>
            </div>

            {colTasks(col.key).map((task) => (
              <div key={task._id} style={{
                background: "white", borderRadius: 10, padding: "12px 14px", marginBottom: 10,
                border: "1px solid #ede8fb", transition: "box-shadow 0.15s",
              }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 12px rgba(106,17,203,0.1)"}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
              >
                <div style={{ fontSize: 13, fontWeight: 500, color: "#2d1b6e", marginBottom: 8 }}>{task.title}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  {NEXT[task.status] ? (
                    <button onClick={() => handleMove(task)} style={{
                      fontSize: 10, padding: "3px 10px", borderRadius: 20, border: "none", cursor: "pointer",
                      fontFamily: "Poppins", fontWeight: 500,
                      background: col.key === "todo" ? "#f3eeff" : "#fffbeb",
                      color: col.key === "todo" ? "#9d50bb" : "#b45309",
                    }}>{NEXT_LABEL[task.status]}</button>
                  ) : (
                    <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 20, background: "#f0fdf4", color: "#15803d", fontWeight: 500 }}>Completed</span>
                  )}
                  <button onClick={() => handleDelete(task._id)}
                    style={{ fontSize: 14, background: "none", border: "none", cursor: "pointer", color: "#ccc" }}
                    onMouseEnter={(e) => e.target.style.color = "#ff6b6b"}
                    onMouseLeave={(e) => e.target.style.color = "#ccc"}
                  >✕</button>
                </div>
              </div>
            ))}

            {colTasks(col.key).length === 0 && (
              <div style={{ textAlign: "center", padding: "20px 0", fontSize: 12, color: "#c9b8e8" }}>No tasks here</div>
            )}

            <button onClick={() => { setForm((f) => ({ ...f, status: col.key })); setShowModal(true); }}
              style={{ width: "100%", padding: 8, borderRadius: 10, border: "1.5px dashed #c9b8e8", background: "transparent", fontFamily: "Poppins", fontSize: 12, color: "#9d50bb", cursor: "pointer", marginTop: 4 }}
              onMouseEnter={(e) => e.target.style.background = "rgba(106,17,203,0.04)"}
              onMouseLeave={(e) => e.target.style.background = "transparent"}
            >+ Add task</button>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal title="Add New Task" onClose={() => setShowModal(false)} onSubmit={handleCreate} loading={saving}>
          <input placeholder="Task title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="todo">Todo</option>
            <option value="inprogress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <select value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })}>
            <option value="">Select Project *</option>
            {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
          {projects.length === 0 && (
            <p style={{ fontSize: 12, color: "#f59e0b", marginTop: -8 }}>⚠ Create a project first before adding tasks.</p>
          )}
        </Modal>
      )}
    </div>
  );
}
