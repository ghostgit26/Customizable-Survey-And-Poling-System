import { useState } from "react";
import {
  Plus, Trash2, Check, ChevronDown, Globe, Lock, Mail
} from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './Survey.css';

const switchStyle = `
.form-check-input {
  background-color: #dee2e6;
  border-color: #dee2e6;
  transition: background-color 0.2s, border-color 0.2s;
}
.form-check-input:checked {
  background-color: #3d246c !important;
  border-color: #3d246c !important;
}
`;

function getDefaultQuestion() {
  return {
    id: crypto.randomUUID(),
    type: "text",
    required: false,
    options: [],
  };
}

const questionTypes = [
  { value: "text", label: "Text" },
  { value: "singleChoice", label: "Single Choice" },
  { value: "multipleChoice", label: "Multiple Choice" },
  { value: "dropdown", label: "Dropdown" },
  { value: "date", label: "Date" },
];

//Preset color palette
const presetColors = [
  "#ffffff", "#f3e8ff", "#e0f7fa", "#fce4ec",
  "#fff3e0", "#e8f5e9", "#ede7f6", "#3d246c"
];

export default function Survey() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [allowedEmails, setAllowedEmails] = useState("");
  const [questions, setQuestions] = useState([getDefaultQuestion()]);
  const [bgColor, setBgColor] = useState("#ffffff");

  const showToast = (msg, type = "danger") => {
    if (type === "success") {
      toast.success(msg);
    } else {
      toast.error(msg);
    }
  };

  const addQuestion = () => setQuestions([...questions, getDefaultQuestion()]);
  const removeQuestion = (id) => {
    if (questions.length === 1) return showToast("You cannot remove all questions");
    setQuestions(questions.filter((q) => q.id !== id));
  };
  const updateQuestion = (id, updates) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  };
  const addOption = (questionId) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? { ...q, options: [...q.options, ""] }
          : q
      )
    );
  };
  const updateOption = (questionId, index, value) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? { ...q, options: q.options.map((opt, i) => (i === index ? value : opt)) }
          : q
      )
    );
  };
  const removeOption = (questionId, index) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? { ...q, options: q.options.filter((_, i) => i !== index) }
          : q
      )
    );
  };

  const handleSave = async () => {
    if (!title.trim()) return showToast("Survey title is required");
    if (isPrivate && !allowedEmails.trim())
      return showToast("Please add at least one email for private surveys");

    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Authentication required. Please log in.");
      return;
    }

    const payload = {
      title,
      description,
      isPrivate,
      allowedEmails: isPrivate ? allowedEmails.split(",").map(e => e.trim()) : [],
      questions,
      bgColor
    };

    try {
      const res = await fetch("http://localhost:5000/api/surveys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        return showToast(data.error || "Failed to create survey");
      }

      showToast("Survey created successfully!", "success");
      setTitle("");
      setDescription("");
      setIsPrivate(false);
      setAllowedEmails("");
      setQuestions([getDefaultQuestion()]);
    } catch (err) {
      showToast("Failed to connect to server");
    }
  };

  return (
    <>
    <div
      className="mx-auto"
      style={{
        maxWidth: 900,
        padding: "1rem",
        minHeight: "100vh",
        backgroundColor: bgColor
      }}
    >
      <style>{switchStyle}</style>

      {/* Color Palette */}
      <div className="card shadow mb-4">
        <div className="card-body">
          <label className="fw-semibold mb-2 d-block">Select Background Color:</label>
          <div className="color-palette">
            {presetColors.map((color) => (
              <div
                key={color}
                className={`color-circle ${bgColor === color ? 'selected' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setBgColor(color)}
              />
            ))}
          </div>

          <div className="color-picker-container">
            <label className="fw-semibold">Or pick a custom color:</label>
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Title & Description */}
      <div className="card shadow mb-4">
        <div className="card-body">
          <input
            className="form-control form-control-lg mb-2 border bg-light fw-semibold"
            placeholder="Survey Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="form-control border bg-light"
            placeholder="Survey Description (optional)"
            value={description}
            rows={2}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="card-footer bg-light d-flex align-items-center justify-content-between">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="survey-privacy"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
            />
            <label className="form-check-label ms-2" htmlFor="survey-privacy">
              Private Survey
            </label>
          </div>
          <div className="d-flex align-items-center text-secondary">
            {isPrivate ? (
              <>
                <Lock size={16} className="me-1" />
                <span>Private</span>
              </>
            ) : (
              <>
                <Globe size={16} className="me-1" />
                <span>Public</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Email Access */}
      {isPrivate && (
        <div className="card shadow mb-4">
          <div className="card-header d-flex align-items-center" style={{ backgroundColor: "#EAEFEF" }}>
            <Mail className="me-2" size={18} style={{ color: "#3d246c" }} />
            <span className="fw-bold">Email Access Control</span>
          </div>
          <div className="card-body">
            <textarea
              className="form-control"
              placeholder="Enter email addresses separated by commas"
              value={allowedEmails}
              rows={2}
              onChange={(e) => setAllowedEmails(e.target.value)}
            />
            <small className="text-muted">
              Example: user@example.com, another@example.com
            </small>
          </div>
        </div>
      )}

      {/* Questions */}
      {questions.map((question) => (
        <div className="card mb-4 border-start shadow" key={question.id}>
          <div className="card-header bg-light d-flex align-items-center justify-content-between">
            <input
              className="form-control border-0 bg-light fw-semibold me-3"
              style={{ fontSize: 18, maxWidth: "60%" }}
              placeholder="Untitled question"
              value={question.title}
              onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
            />
            <select
              className="form-select w-auto"
              value={question.type}
              onChange={e => {
                const type = e.target.value;
                const updates = { type };
                if (
                  ["multipleChoice",  "dropdown", "singleChoice"].includes(type) &&
                  !question.options.length
                ) {
                  updates.options = ["", ""];
                }
                updateQuestion(question.id, updates);
              }}
            >
              {questionTypes.map(qt => (
                <option value={qt.value} key={qt.value}>{qt.label}</option>
              ))}
            </select>
          </div>
          <div className="card-body pt-3">
            {["singleChoice", "multipleChoice", "dropdown"].includes(question.type) && (
              <>
                {question.options.map((option, optIndex) => (
                  <div className="d-flex align-items-center mb-2" key={optIndex}>
                     {question.type === "singleChoice" && (
                        <span
                          className="rounded-circle border border-primary me-2 d-flex align-items-center justify-content-center"
                          style={{ width: 18, height: 18 }}
                        >
                          <span
                            className="bg-primary rounded-circle"
                            style={{ width: 10, height: 10 }}
                          ></span>
                        </span>
                      )}
                    
                    {question.type === "multipleChoice" && (
                      <span className="border rounded me-2 d-flex align-items-center justify-content-center" style={{ width: 18, height: 18 }}>
                        <Check className="text-secondary" size={12} />
                      </span>
                    )}
                    {question.type === "dropdown" && <ChevronDown className="text-secondary me-2" size={18} />}
                    <input
                      className="form-control me-2"
                      value={option}
                      placeholder={`Option ${optIndex + 1}`}
                      onChange={e => updateOption(question.id, optIndex, e.target.value)}
                    />
                    <button
                      className="btn btn-link text-danger p-0"
                      onClick={() => removeOption(question.id, optIndex)}
                      title="Remove option"
                      type="button"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                <button
                  className="btn btn-outline-primary btn-sm mt-2 d-flex align-items-center"
                  type="button"
                  onClick={() => addOption(question.id)}
                >
                  <Plus className="me-1" size={16} /> Add Option
                </button>
              </>
            )}
{question.type === "text" && (
  <div className="border rounded-2 p-3 bg-light mb-2">
    <span className="text-muted">Text answer field</span>
  </div>
)}

{question.type === "date" && (
  <div className="border rounded-2 p-3 bg-light mb-2">
    <input type="date" className="form-control" disabled />
    <small className="text-muted">Date input field</small>
  </div>
)}

          </div>
          <div className="card-footer d-flex justify-content-between align-items-center bg-light">
            <div className="form-check form-switch mb-0">
              <input
                className="form-check-input"
                type="checkbox"
                id={`required-${question.id}`}
                checked={question.required}
                onChange={e => updateQuestion(question.id, { required: e.target.checked })}
              />
              <label className="form-check-label ms-2" htmlFor={`required-${question.id}`}>
                Required
              </label>
            </div>
            <button
              className="btn btn-link text-danger"
              onClick={() => removeQuestion(question.id)}
              type="button"
            >
              <Trash2 className="me-2" size={18} />
            </button>
          </div>
        </div>
      ))}

      <div className="d-flex justify-content-center mb-4">
        <button
          className="btn btn-outline-primary d-flex align-items-center"
          type="button"
          onClick={addQuestion}
        >
          Add Question
        </button>
      </div>

      <div className="d-flex justify-content-end gap-3">
        <button
          onClick={handleSave}
          className="btn d-flex align-items-center mb-3 text-white"
          style={{ backgroundColor: "#3d246c" }}
          type="button"
        >
          Publish Survey
        </button>
      </div>
    </div>
    </>
  );
}
