import React, { useState } from "react";
import axios from "axios";
import { Form, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import {
   Trash2
} from "lucide-react";

const CreatePoll = ({ onPollCreated }) => {
  const [question, setQuestion] = useState("");
  const [type, setType] = useState("Single Choice");
  const [options, setOptions] = useState(["", ""]);
  const [isPublic, setIsPublic] = useState(true);
  const [emails, setEmails] = useState("");
  const [loading, setLoading] = useState(false);

   //add a new empty option to the list
  const handleAddOption = () => setOptions([...options, ""]);
  //update the text of a specific option based on user input
  const handleOptionChange = (i, val) => {
    const newOpts = [...options];
    newOpts[i] = val;
    setOptions(newOpts);
  };
 //removes an option,alleast 2 options are always present
  const handleRemoveOption = (i) => {
    if (options.length <= 2) return;
    const newOpts = options.filter((_, idx) => idx !== i);
    setOptions(newOpts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  //validations
    if (!question.trim()) {
      toast.error("Poll question is required");
      return;
    }
  
    if (type !== "Yes/No") {
      const filledOptions = options.filter((opt) => opt.trim() !== "");
      if (filledOptions.length < 2) {
        toast.error("At least two options are required");
        return;
      }
    }
  
    if (!isPublic && emails.trim() === "") {
      toast.error("Please enter at least one email for a private poll");
      return;
    }
  
    setLoading(true); //start the loading state for form submission
  
    const poll = {
      question: question.trim(),
      options: type === "Yes/No" ? ["Yes", "No"] : options.map((opt) => opt.trim()),
      type,
      isPublic,
      emails: isPublic
        ? []
        : emails
            .split(",")
            .map((e) => e.trim())
            .filter(Boolean),
    };
  
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/polls", poll, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      // Reset form on success
      setQuestion("");
      setOptions(["", ""]);
      setType("Single Choice");
      setIsPublic(true);
      setEmails("");
      if (onPollCreated) onPollCreated();
      toast.success("Poll created!");
    } catch (err) {
      toast.error("Failed to create poll.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="container mt-4">
      <h3>Create Poll</h3>
      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Label>Question</Form.Label>
          <Form.Control
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </Form.Group>
        {/* dropdown to choose poll type */}
        <Form.Group className="mt-3">
          <Form.Label >Type</Form.Label>
          <Form.Select value={type} onChange={(e) => setType(e.target.value)}>
            <option>Single Choice</option>
            <option>Yes/No</option>
          </Form.Select>
        </Form.Group>
        {type !== "Yes/No" && (
          <Form.Group className="mt-3">
            <Form.Label>Options</Form.Label>
            {options.map((opt, i) => (
              <div className="d-flex mb-2" key={i}>
                <Form.Control
                  value={opt}
                  onChange={(e) => handleOptionChange(i, e.target.value)}
                />
                 <button
                      className="btn btn-link text-danger  ms-2"
                      onClick={() => handleRemoveOption(i)}
                      disabled={options.length <= 2}
                      type="button"
                      size="md"
                    >
                      <Trash2 size={18} />
                    </button>
              </div>
            ))}
            <Button variant="secondary" size="sm" onClick={handleAddOption} type="button">
              Add Option
            </Button>
          </Form.Group>
        )}
        {/* Public/Private */}
        <Form.Group className="mt-3">
          <Form.Check
            type="switch"
            label={isPublic ? "Public" : "Private"}
            checked={isPublic}
            onChange={() => setIsPublic(!isPublic)}
          />
        </Form.Group>
        {/* if it is private shows this field only */}
        {!isPublic && (
          <Form.Group className="mt-3">
            <Form.Label>Invite by Email (comma separated)</Form.Label>
            <Form.Control
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder="user1@example.com, user2@example.com"
            />
          </Form.Group>
        )}
        {/* submit button */}
        <Button variant="primary" className="mt-4 mb-4" type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Poll"}
        </Button>
      </Form>
    </div>
  );
};

export default CreatePoll;

