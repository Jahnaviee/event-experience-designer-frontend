import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const EventContext = createContext();

// Remove trailing slashes to prevent URLs such as /api/events//1.
const API_URL = "https://event-experience-designer-backend.onrender.com/api/events";

// Read JSON safely and give useful errors for unexpected responses.
async function readResponse(response) {
  const text = await response.text();

  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `Server returned invalid JSON (HTTP ${response.status}). ` +
      `Response: ${text.slice(0, 200)}`
    );
  }
}

// Convert backend event data into the format used by React.
function formatEvent(event = {}) {
  return {
    ...event,
    id: event.id,
    date: event.eventDate || event.date || "",
    venue: event.location || event.venue || "",
    location: event.location || event.venue || "",
    status:
      event.published || event.isPublished
        ? "Published"
        : event.status || "Draft",
    createdAt: event.createdAt || new Date().toISOString(),
  };
}

// Convert frontend event data into the Spring Boot format.
function formatPayload(event) {
  return {
    title: event.title,
    description: event.description || "",
    eventDate: event.date || event.eventDate || null,
    location: event.venue || event.location || "",
    ownerId: event.ownerId || 1,
    publicSlug: event.publicSlug || null,
    published:
      event.published !== undefined
        ? event.published
        : event.status === "Published",
  };
}

// Make requests and report HTTP errors clearly.
async function apiRequest(url, options = {}) {
  let response;

  try {
    response = await fetch(url, options);
  } catch (error) {
    throw new Error(
      `Cannot connect to the backend. Check the API URL, CORS settings, ` +
      `and backend deployment. ${error.message}`
    );
  }

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      `API request failed: HTTP ${response.status} ${response.statusText}. ` +
      `URL: ${url}. ` +
      `Response: ${message.slice(0, 200) || "(empty response)"}`
    );
  }

  return readResponse(response);
}

export function EventProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest(API_URL);

      if (!Array.isArray(data)) {
        throw new Error(
          `Expected an array of events from ${API_URL}, ` +
          "but the server returned something else."
        );
      }

      setEvents(data.map(formatEvent));
    } catch (err) {
      console.error("Fetch events error:", err);
      setError(err.message || "Unable to load events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const addEvent = async (event) => {
    try {
      setError("");

      const savedEvent = await apiRequest(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formatPayload(event)),
      });

      const formattedEvent = formatEvent({
        ...event,
        ...(savedEvent && typeof savedEvent === "object"
          ? savedEvent
          : {}),
      });

      setEvents((previousEvents) => [
        ...previousEvents,
        formattedEvent,
      ]);

      return savedEvent || formattedEvent;
    } catch (err) {
      console.error("Create event error:", err);
      setError(err.message || "Failed to create event.");
      throw err;
    }
  };

  const updateEvent = async (id, updatedEvent) => {
    try {
      setError("");

      const currentEvent = events.find(
        (event) => String(event.id) === String(id)
      );

      if (!currentEvent) {
        throw new Error(`Event with ID ${id} was not found.`);
      }

      const mergedEvent = {
        ...currentEvent,
        ...updatedEvent,
      };

      const savedEvent = await apiRequest(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formatPayload(mergedEvent)),
      });

      const formattedEvent = formatEvent({
        ...mergedEvent,
        ...(savedEvent && typeof savedEvent === "object"
          ? savedEvent
          : {}),
      });

      setEvents((previousEvents) =>
        previousEvents.map((event) =>
          String(event.id) === String(id)
            ? formattedEvent
            : event
        )
      );

      return savedEvent || formattedEvent;
    } catch (err) {
      console.error("Update event error:", err);
      setError(err.message || "Failed to update event.");
      throw err;
    }
  };

  const deleteEvent = async (id) => {
    try {
      setError("");

      await apiRequest(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      setEvents((previousEvents) =>
        previousEvents.filter(
          (event) => String(event.id) !== String(id)
        )
      );
    } catch (err) {
      console.error("Delete event error:", err);
      setError(err.message || "Failed to delete event.");
      throw err;
    }
  };

  const publishEvent = async (id) => {
    const event = events.find(
      (item) => String(item.id) === String(id)
    );

    if (!event) {
      throw new Error(`Event with ID ${id} was not found.`);
    }

    return updateEvent(id, {
      status: "Published",
      published: true,
    });
  };

  return (
    <EventContext.Provider
      value={{
        events,
        loading,
        error,
        fetchEvents,
        addEvent,
        updateEvent,
        deleteEvent,
        publishEvent,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  return useContext(EventContext);
}
