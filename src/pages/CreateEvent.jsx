import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEvents } from "../Context/EventContext";

function CreateEvent() {
  const navigate = useNavigate();
  const { addEvent } = useEvents();

  const [formData, setFormData] = useState({
    title: "",
    type: "Technical Fest",
    date: "",
    venue: "",
    attendees: "",
    description: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.date || !formData.venue.trim()) {
      alert("Please fill Event Name, Date and Venue.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await addEvent({
        ...formData,
        title: formData.title.trim(),
        venue: formData.venue.trim(),
        attendees: Number(formData.attendees) || 0,
      });

      // Navigate only after the backend confirms the event was saved.
      navigate("/events");
    } catch (err) {
      console.error("Failed to create event:", err);
      setError(
        err.message ||
          "Could not save the event. Please check that the backend is running."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-heading">
        <div>
          <p className="eyebrow">NEW EVENT</p>
          <h1>Create Event</h1>
          <p>Start by adding the basic details of your event.</p>
        </div>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Event Name *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. TechNova 2026"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Event Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              <option>Technical Fest</option>
              <option>Cultural Event</option>
              <option>Workshop</option>
              <option>Seminar</option>
              <option>Sports Event</option>
              <option>Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Event Date *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Venue *</label>
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              placeholder="e.g. Main Auditorium"
              required
            />
          </div>

          <div className="form-group">
            <label>Expected Attendees</label>
            <input
              type="number"
              name="attendees"
              value={formData.attendees}
              onChange={handleChange}
              placeholder="e.g. 500"
              min="1"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            rows="5"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your event..."
          />
        </div>

        {error && (
          <p role="alert" style={{ color: "red" }}>
            {error}
          </p>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate("/events")}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="primary-button"
            disabled={saving}
          >
            {saving ? "Saving..." : "Create Event →"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateEvent;
