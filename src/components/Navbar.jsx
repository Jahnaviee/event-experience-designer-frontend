function Navbar() {

  return (

    <header className="navbar">

      <div>

        <h3>
          Event Experience Designer
        </h3>

        <p>
          Design memorable campus experiences
        </p>

      </div>


      <div className="navbar-right">

        <button className="notification">
          🔔
        </button>

        <div className="profile">

          <div className="avatar">
            H
          </div>

          <div>

            <strong>
              Organizer
            </strong>

            <span>
              Event Coordinator
            </span>

          </div>

        </div>

      </div>

    </header>

  );
}

export default Navbar;