import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import CreateEvent from "./pages/CreateEvent";
import Settings from "./pages/Settings";
import VenueDesigner from "./pages/VenueDesigner";


function App() {

  return (

    <BrowserRouter>

      <div className="app">

        {/* SIDEBAR */}

        <Sidebar />


        {/* MAIN AREA */}

        <div className="main-area">

          {/* NAVBAR */}

          <Navbar />


          {/* PAGE CONTENT */}

          <main className="content">

            <Routes>

              {/* DASHBOARD */}

              <Route
                path="/"
                element={<Dashboard />}
              />


              {/* MY EVENTS */}

              <Route
                path="/events"
                element={<Events />}
              />


              {/* CREATE EVENT */}

              <Route
                path="/create-event"
                element={<CreateEvent />}
              />


              {/* SETTINGS */}

              <Route
                path="/settings"
                element={<Settings />}
              />


              {/* VENUE DESIGNER */}

              <Route
                path="/venue-designer"
                element={<VenueDesigner />}
              />

            </Routes>

          </main>

        </div>

      </div>

    </BrowserRouter>

  );

}


export default App;