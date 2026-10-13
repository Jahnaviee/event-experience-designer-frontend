import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const EventContext = createContext();

const API_URL = "/api/events";

// Convert backend event data into the format used by the React UI.
function formatEvent(event) {
  return {
    ...event,
    id: event.id,
    date: event.eventDate || event.date || "",
    venue: event.location || event.venue || "",
    location: event.location || event.venue || "",
    status: event.published ? "Published" : "Draft",
    createdAt: event.createdAt || new Date().toISOString(),
  };
}

// Convert frontend event data into the format accepted by Spring Boot.
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

export function EventProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load events from the Spring Boot backend.
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(
          `Could not load events. Server status: ${response.status}`
        );
      }

      const data = await response.json();

      // Diagnostic logs: check what the frontend receives.
      console.log("Events received from backend:", data);

      const formattedEvents = data.map(formatEvent);

      console.log("Formatted events:", formattedEvents);

      setEvents(formattedEvents);
    } catch (err) {
      console.error("Fetch events error:", err);

      setError(
        err.message ||
          "Unable to connect to the backend. Please check that Spring Boot is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Create an event in the database.
  const addEvent = async (event) => {
    try {
      setError("");

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formatPayload(event)),
      });

      if (!response.ok) {
        throw new Error(
          `Could not create the event. Server status: ${response.status}`
        );
      }

      const savedEvent = await response.json();
      const formattedEvent = formatEvent({
        ...event,
        ...savedEvent,
      });

      setEvents((previousEvents) => [
        ...previousEvents,
        formattedEvent,
      ]);

      console.log("Created event:", formattedEvent);

      return savedEvent;
    } catch (err) {
      console.error("Create event error:", err);
      setError(err.message || "Failed to create event.");
      throw err;
    }
  };

  // Update an existing event in the database.
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

      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formatPayload(mergedEvent)),
      });

      if (!response.ok) {
        throw new Error(
          `Could not update the event. Server status: ${response.status}`
        );
      }

      const savedEvent = await response.json();

      const formattedEvent = formatEvent({
        ...currentEvent,
        ...updatedEvent,
        ...savedEvent,
      });

      setEvents((previousEvents) =>
        previousEvents.map((event) =>
          String(event.id) === String(id)
            ? formattedEvent
            : event
        )
      );

      console.log("Updated event:", formattedEvent);

      return savedEvent;
    } catch (err) {
      console.error("Update event error:", err);
      setError(err.message || "Failed to update event.");
      throw err;
    }
  };

  // Delete an event from the database.
  const deleteEvent = async (id) => {
    try {
      setError("");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(
          `Could not delete the event. Server status: ${response.status}`
        );
      }

      setEvents((previousEvents) =>
        previousEvents.filter(
          (event) => String(event.id) !== String(id)
        )
      );

      console.log("Deleted event ID:", id);
    } catch (err) {
      console.error("Delete event error:", err);
      setError(err.message || "Failed to delete event.");
      throw err;
    }
  };

  // Publish an event in the database.
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
