import { useState } from "react";
import { Link } from "react-router-dom";
import { useEvents } from "../Context/EventContext.jsx";

function Events() {
  const { events, deleteEvent, publishEvent, loading, error } = useEvents();

  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const formatDate = (date) => {
    if (!date) return "No date";

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getEventClass = (type) => {
    if (type === "Technical Fest") return "tech";
    if (type === "Cultural Event") return "cultural";
    if (type === "Workshop") return "workshop";

    return "tech";
  };

  const handleView = (event) => {
    alert(
      "Event: " + event.title +
      "\n\nType: " + (event.type || "Not specified") +
      "\nVenue: " + (event.venue || "Not specified") +
      "\nDate: " + formatDate(event.date) +
      "\nAttendees: " + (event.attendees || 0) +
      "\nStatus: " + (event.status || "Draft")
    );
  };

  const handleDelete = async (event) => {
    const confirmed = window.confirm(
      `Delete "${event.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setBusyId(event.id);
      setActionError("");
      await deleteEvent(event.id);
    } catch (err) {
      setActionError(err.message || "Could not delete this event.");
    } finally {
      setBusyId(null);
    }
  };

  const handlePublish = async (event) => {
    try {
      setBusyId(event.id);
      setActionError("");
      await publishEvent(event.id);
    } catch (err) {
      setActionError(err.message || "Could not publish this event.");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="page-heading">
        <div>
          <p className="eyebrow">EVENTS</p>
          <h1>My Events</h1>
          <p>Loading your events...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <p className="eyebrow">EVENTS</p>
          <h1>My Events</h1>
          <p>Manage all your campus events from one place.</p>
        </div>

        <Link to="/create-event" className="primary-button">
          + Create Event
        </Link>
      </div>

      {(actionError || error) && (
        <p role="alert" style={{ color: "red" }}>
          {actionError || error}
        </p>
      )}

      {events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">◫</div>
          <h2>Your events will appear here</h2>
          <p>
            Create your first event and start designing
            an unforgettable experience.
          </p>
          <Link
            to="/create-event"
            className="primary-button"
            style={{ marginTop: "18px" }}
          >
            + Create Your First Event
          </Link>
        </div>
      ) : (
        <div className="event-grid">
          {events.map((event) => {
            const busy = busyId === event.id;

            return (
              <div className="event-card-large" key={event.id}>
                <div
                  className={
                    "event-banner " + getEventClass(event.type)
                  }
                >
                  <span>{event.type || "EVENT"}</span>
                </div>

                <div className="event-info">
                  <div className="status-row">
                    <span className="event-date">
                      {formatDate(event.date)}
                    </span>

                    <span
                      className={
                        event.status === "Published"
                          ? "status published"
                          : "status draft"
                      }
                    >
                      {event.status || "Draft"}
                    </span>
                  </div>

                  <h3>{event.title || "Untitled Event"}</h3>

                  <p>
                    {event.description || "No description added."}
                  </p>

                  <div className="event-footer">
                    <span>
                      📍 {event.venue || "Venue not specified"}
                    </span>
                    <span>👥 {event.attendees || 0}</span>
                  </div>

                  <div className="event-actions">
                    <button
                      type="button"
                      className="small-button"
                      onClick={() => handleView(event)}
                      disabled={busy}
                    >
                      View
                    </button>

                    <Link
                      to={
                        "/venue-designer?eventId=" +
                        encodeURIComponent(String(event.id))
                      }
                      className="small-button"
                    >
                      🎨 Design Venue
                    </Link>

                    {event.status !== "Published" && (
                      <button
                        type="button"
                        className="small-button publish-button"
                        onClick={() => handlePublish(event)}
                        disabled={busy}
                      >
                        {busy ? "Saving..." : "Publish"}
                      </button>
                    )}

                    <button
                      type="button"
                      className="small-button delete-button"
                      onClick={() => handleDelete(event)}
                      disabled={busy}
                    >
                      {busy ? "Saving..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Events;
