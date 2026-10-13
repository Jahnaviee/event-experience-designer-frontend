function Settings() {

  return (

    <div>

      <div className="page-heading">

        <div>

          <p className="eyebrow">
            ACCOUNT
          </p>

          <h1>
            Settings
          </h1>

          <p>
            Manage your account and preferences.
          </p>

        </div>

      </div>


      <div className="settings-card">

        <h2>
          Profile Settings
        </h2>

        <div className="form-group">

          <label>
            Name
          </label>

          <input
            type="text"
            value="Event Organizer"
            readOnly
          />

        </div>


        <div className="form-group">

          <label>
            Email
          </label>

          <input
            type="email"
            value="organizer@college.edu"
            readOnly
          />

        </div>

      </div>

    </div>

  );
}

export default Settings;