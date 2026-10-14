import { Link } from "react-router-dom";
import { useEvents } from "../Context/EventContext.jsx";

function Dashboard() {

  const { events } = useEvents();



  const formatDate = (date) => {

    if (!date) {
      return "No date";
    }

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });

  };


  // =========================
  // GET UPCOMING EVENTS
  // =========================

  const upcomingEvents = [...events]
    .filter((event) => {

      if (!event.date) {
        return false;
      }

      const eventDate = new Date(event.date);

      const today = new Date();

      today.setHours(0, 0, 0, 0);

      return eventDate >= today;

    })
    .sort((a, b) => {

      return new Date(a.date) - new Date(b.date);

    })
    .slice(0, 3);


  // =========================
  // PUBLISHED EVENTS
  // =========================

  const publishedCount = events.filter(
    (event) => event.status === "Published"
  ).length;


  // =========================
  // TOTAL ATTENDEES
  // =========================

  const totalAttendees = events.reduce(
    (total, event) => {

      return total + Number(event.attendees || 0);

    },
    0
  );


  // =========================
  // GET EVENT BANNER CLASS
  // =========================

  const getEventClass = (type) => {

    if (type === "Technical Fest") {
      return "tech";
    }

    if (type === "Cultural Event") {
      return "cultural";
    }

    if (type === "Workshop") {
      return "workshop";
    }

    return "tech";

  };


  return (

    <div className="dashboard">


      {/* =========================
          HERO SECTION
      ========================== */}

      <section className="welcome">

        <div>

          <p className="eyebrow">
            CAMPUS EVENTS
          </p>

          <h1>
            Design experiences,
            <br />
            not just events.
          </h1>

          <p className="welcome-text">
            Plan your venue, activities, attendee journey,
            and event experience — all in one place.
          </p>

          <Link
            to="/create-event"
            className="primary-button"
          >
            + Create New Event
          </Link>

        </div>


        {/* HERO ILLUSTRATION */}

        <div className="welcome-illustration">

          <div className="circle circle-one"></div>

          <div className="circle circle-two"></div>

          <div className="event-card">

            <div className="mini-stage">
              STAGE
            </div>

            <div className="mini-seats">
              ● ● ● ●
              <br />
              ● ● ● ●
              <br />
              ● ● ● ●
            </div>

          </div>

        </div>

      </section>



      {/* =========================
          STATISTICS
      ========================== */}

      <section className="stats">


        {/* TOTAL EVENTS */}

        <div className="stat-card">

          <div className="stat-icon purple">
            ◫
          </div>

          <div>

            <span>
              Total Events
            </span>

            <h2>
              {events.length}
            </h2>

          </div>

        </div>



        {/* UPCOMING EVENTS */}

        <div className="stat-card">

          <div className="stat-icon blue">
            ◷
          </div>

          <div>

            <span>
              Upcoming Events
            </span>

            <h2>
              {upcomingEvents.length}
            </h2>

          </div>

        </div>



        {/* PUBLISHED EVENTS */}

        <div className="stat-card">

          <div className="stat-icon green">
            ✓
          </div>

          <div>

            <span>
              Published
            </span>

            <h2>
              {publishedCount}
            </h2>

          </div>

        </div>



        {/* TOTAL ATTENDEES */}

        <div className="stat-card">

          <div className="stat-icon orange">
            👥
          </div>

          <div>

            <span>
              Total Attendees
            </span>

            <h2>
              {totalAttendees}
            </h2>

          </div>

        </div>

      </section>



      {/* =========================
          UPCOMING EVENTS HEADER
      ========================== */}

      <section className="section-header">

        <div>

          <h2>
            Upcoming Events
          </h2>

          <p>
            Manage and continue designing your events.
          </p>

        </div>

        <Link to="/events">
          View all →
        </Link>

      </section>



      {/* =========================
          UPCOMING EVENTS
      ========================== */}

      {upcomingEvents.length === 0 ? (

        <div className="empty-state">

          <div className="empty-icon">
            +
          </div>

          <h2>
            No upcoming events
          </h2>

          <p>
            Create your first campus event to get started.
          </p>

          <Link
            to="/create-event"
            className="primary-button"
            style={{ marginTop: "18px" }}
          >
            + Create Event
          </Link>

        </div>

      ) : (

        <section className="event-grid">

          {upcomingEvents.map((event) => (

            <div
              className="event-card-large"
              key={event.id}
            >


              {/* EVENT BANNER */}

              <div
                className={`event-banner ${getEventClass(
                  event.type
                )}`}
              >

                <span>
                  {event.type || "EVENT"}
                </span>

              </div>



              {/* EVENT INFORMATION */}

              <div className="event-info">


                {/* DATE */}

                <span className="event-date">
                  {formatDate(event.date)}
                </span>


                {/* TITLE */}

                <h3>
                  {event.title || "Untitled Event"}
                </h3>


                {/* DESCRIPTION */}

                <p>
                  {event.description ||
                    "No description added."}
                </p>


                {/* EVENT DETAILS */}

                <div className="event-footer">

                  <span>
                    📍 {event.venue || "Venue not specified"}
                  </span>

                  <span>
                    👥 {event.attendees || 0}
                  </span>

                </div>

              </div>

            </div>

          ))}

        </section>

      )}

    </div>

  );

}


export default Dashboard;