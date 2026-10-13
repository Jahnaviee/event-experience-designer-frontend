
import {

  Stage,

  Layer,

  Rect,

  Text,

  Circle,

} from "react-konva";

import { useState, useEffect, useCallback } from "react";

import { useSearchParams } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "/api/events";

const DEFAULT_POSITIONS = {

  stage: { x: 300, y: 50 },

  seating: { x: 250, y: 220 },

  food: { x: 550, y: 200 },

  registration: { x: 80, y: 350 },

  photo: { x: 550, y: 350 },

  restroom: { x: 80, y: 150 },

};

const ELEMENT_DETAILS = {

  stage: {

    type: "stage",

    label: "STAGE",

    width: 200,

    height: 80,

    color: "#754d94",

  },

  seating: {

    type: "seating",

    label: "SEATING",

    width: 230,

    height: 40,

    color: "#9b6bb3",

  },

  food: {

    type: "food",

    label: "FOOD STALL",

    width: 150,

    height: 80,

    color: "#e6a23c",

  },

  registration: {

    type: "registration",

    label: "REGISTRATION",

    width: 180,

    height: 70,

    color: "#5f8dc9",

  },

  photo: {

    type: "photo",

    label: "PHOTO ZONE",

    width: 160,

    height: 80,

    color: "#d86ba3",

  },

  restroom: {

    type: "restroom",

    label: "RESTROOM",

    width: 150,

    height: 70,

    color: "#6c9b78",

  },

};

const DEFAULT_VISIBILITY = {

  showSeating: false,

  showFood: false,

  showRegistration: false,

  showPhoto: false,

  showRestroom: false,

};

const VISIBILITY_TO_ELEMENT = {

  seating: "showSeating",

  food: "showFood",

  registration: "showRegistration",

  photo: "showPhoto",

  restroom: "showRestroom",

};

function parseVisibility(metadata) {

  if (!metadata) return {};

  try {

    const parsed =

      typeof metadata === "string"

        ? JSON.parse(metadata)

        : metadata;

    return parsed?.visibility || {};

  } catch {

    return {};

  }

}

function buildLayoutFromElements(elements) {

  const positions = { ...DEFAULT_POSITIONS };

  const visibility = { ...DEFAULT_VISIBILITY };

  elements.forEach((element) => {

    const type = element.type;

    if (!ELEMENT_DETAILS[type]) return;

    positions[type] = {

      x: Number(element.x ?? DEFAULT_POSITIONS[type].x),

      y: Number(element.y ?? DEFAULT_POSITIONS[type].y),

    };

    if (type !== "stage") {

      visibility[VISIBILITY_TO_ELEMENT[type]] = true;

    }

    const savedVisibility = parseVisibility(element.metadata);

    Object.assign(visibility, savedVisibility);

  });

  return { positions, visibility };

}

function createPayload(eventId, positions, visibility) {

  return Object.entries(ELEMENT_DETAILS)

    .filter(([type]) => {

      if (type === "stage") return true;

      return visibility[VISIBILITY_TO_ELEMENT[type]];

    })

    .map(([type, details]) => ({

      eventId: Number(eventId),

      type,

      label: details.label,

      x: positions[type].x,

      y: positions[type].y,

      width: details.width,

      height: details.height,

      rotation: 0,

      color: details.color,

      metadata: JSON.stringify({

        visibility,

      }),

    }));

}

function VenueDesigner() {

  const [searchParams] = useSearchParams();

  const eventId = searchParams.get("eventId");

  const [showSeating, setShowSeating] = useState(false);

  const [showFood, setShowFood] = useState(false);

  const [showRegistration, setShowRegistration] = useState(false);

  const [showPhoto, setShowPhoto] = useState(false);

  const [showRestroom, setShowRestroom] = useState(false);

  const [positions, setPositions] = useState({

    ...DEFAULT_POSITIONS,

  });

  const [selectedElement, setSelectedElement] = useState(null);

  const [saveMessage, setSaveMessage] = useState("");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const visibility = {

    showSeating,

    showFood,

    showRegistration,

    showPhoto,

    showRestroom,

  };

  const applyLayout = useCallback((elements) => {

    const layout = buildLayoutFromElements(elements);

    setPositions(layout.positions);

    setShowSeating(layout.visibility.showSeating);

    setShowFood(layout.visibility.showFood);

    setShowRegistration(layout.visibility.showRegistration);

    setShowPhoto(layout.visibility.showPhoto);

    setShowRestroom(layout.visibility.showRestroom);

  }, []);

  useEffect(() => {

    let cancelled = false;

    async function loadLayout() {

      setLoading(true);

      setSaveMessage("");

      setSelectedElement(null);

      setPositions({ ...DEFAULT_POSITIONS });

      setShowSeating(false);

      setShowFood(false);

      setShowRegistration(false);

      setShowPhoto(false);

      setShowRestroom(false);

      if (!eventId || !/^\d+$/.test(eventId)) {

        setLoading(false);

        setSaveMessage(

          "Open the designer from a specific event to load its saved layout."

        );

        return;

      }

      try {

        const response = await fetch(

          `${API_URL}/${eventId}/venue-elements`

        );

        if (!response.ok) {

          throw new Error(

            `Could not load layout (HTTP ${response.status}).`

          );

        }

        const elements = await response.json();

        if (!cancelled) {

          applyLayout(Array.isArray(elements) ? elements : []);

        }

      } catch (error) {

        if (!cancelled) {

          console.error("Could not load venue layout:", error);

          setSaveMessage(

            "Could not load layout from the backend. Check that the backend is running."

          );

        }

      } finally {

        if (!cancelled) setLoading(false);

      }

    }

    loadLayout();

    return () => {

      cancelled = true;

    };

  }, [eventId, applyLayout]);

  const updatePosition = (element, x, y) => {

    setPositions((previous) => ({

      ...previous,

      [element]: { x, y },

    }));

  };

  const saveLayout = async () => {

    if (!eventId || !/^\d+$/.test(eventId)) {

      setSaveMessage(

        "Please open Venue Designer from a specific event before saving."

      );

      return;

    }

    setSaving(true);

    setSaveMessage("");

    try {

      const payload = createPayload(

        eventId,

        positions,

        visibility

      );

      const response = await fetch(

        `${API_URL}/${eventId}/venue-elements`,

        {

          method: "PUT",

          headers: {

            "Content-Type": "application/json",

          },

          body: JSON.stringify(payload),

        }

      );

      if (!response.ok) {

        const details = await response.text();

        throw new Error(

          details || `Save failed (HTTP ${response.status}).`

        );

      }

      setSaveMessage("Venue layout saved to MySQL! 🎉");

    } catch (error) {

      console.error("Could not save venue layout:", error);

      setSaveMessage(

        `Could not save layout: ${error.message}`

      );

    } finally {

      setSaving(false);

    }

  };

  const deleteSelected = () => {

    if (!selectedElement) return;

    if (selectedElement === "stage") {

      setSaveMessage("The stage cannot be deleted.");

      return;

    }

    const setters = {

      seating: setShowSeating,

      food: setShowFood,

      registration: setShowRegistration,

      photo: setShowPhoto,

      restroom: setShowRestroom,

    };

    setters[selectedElement]?.(false);

    setSelectedElement(null);

    setSaveMessage(

      "Element removed. Click SAVE LAYOUT to save the change to MySQL."

    );

  };

  useEffect(() => {

    const handleKeyDown = (event) => {

      const tagName = event.target?.tagName;

      if (

        tagName === "INPUT" ||

        tagName === "TEXTAREA" ||

        event.target?.isContentEditable

      ) {

        return;

      }

      if (event.key === "Delete" || event.key === "Backspace") {

        deleteSelected();

      }

    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {

      window.removeEventListener("keydown", handleKeyDown);

    };

  }, [selectedElement]);

  return (

    <div className="venue-designer">

      <h1>Venue Designer</h1>

      <p>Design your event venue layout.</p>

      {eventId ? (

        <p

          style={{

            fontSize: "13px",

            color: "#754d94",

            marginTop: "5px",

          }}

        >

          Designing venue for Event ID: {eventId}

        </p>

      ) : (

        <p style={{ fontSize: "13px", color: "#754d94" }}>

          No event selected. Open the designer from an event.

        </p>

      )}

      {loading && <p>Loading venue layout...</p>}

      <div className="designer-area">

        <div className="elements-panel">

          <h2>ELEMENTS</h2>

          <button onClick={() => setSelectedElement("stage")}>

            🎤 Stage

          </button>

          <button

            onClick={() => {

              setShowSeating(true);

              setSelectedElement("seating");

            }}

          >

            🪑 Seating

          </button>

          <button

            onClick={() => {

              setShowFood(true);

              setSelectedElement("food");

            }}

          >

            🍔 Food Stall

          </button>

          <button

            onClick={() => {

              setShowRegistration(true);

              setSelectedElement("registration");

            }}

          >

            📋 Registration Desk

          </button>

          <button

            onClick={() => {

              setShowPhoto(true);

              setSelectedElement("photo");

            }}

          >

            📸 Photo Zone

          </button>

          <button

            onClick={() => {

              setShowRestroom(true);

              setSelectedElement("restroom");

            }}

          >

            🚻 Restroom

          </button>

          <button

            onClick={saveLayout}

            disabled={loading || saving || !eventId}

            style={{

              marginTop: "20px",

              width: "100%",

              padding: "14px",

              background: "#754d94",

              color: "white",

              border: "none",

              borderRadius: "8px",

              cursor: saving ? "wait" : "pointer",

              fontSize: "15px",

              fontWeight: "bold",

              opacity: loading || saving || !eventId ? 0.6 : 1,

            }}

          >

            {saving ? "SAVING..." : "💾 SAVE LAYOUT"}

          </button>

          <button

            onClick={deleteSelected}

            style={{

              marginTop: "10px",

              width: "100%",

              padding: "12px",

              background: "#fff0f0",

              color: "#d9534f",

              border: "1px solid #f0b5b5",

              borderRadius: "8px",

              cursor: "pointer",

              fontSize: "14px",

              fontWeight: "600",

            }}

          >

            🗑️ Delete Selected

          </button>

          {saveMessage && (

            <div

              role="status"

              style={{

                marginTop: "15px",

                padding: "10px",

                background: "#eee4f3",

                color: "#754d94",

                borderRadius: "8px",

                fontSize: "13px",

                textAlign: "center",

                overflowWrap: "anywhere",

              }}

            >

              {saveMessage}

            </div>

          )}

        </div>

        <div className="canvas-area">

          <h2>VENUE CANVAS</h2>

          <Stage

            width={800}

            height={500}

            style={{

              background: "#f3edf7",

              border: "2px solid #754d94",

              maxWidth: "100%",

            }}

          >

            <Layer>

              <Rect

                x={positions.stage.x}

                y={positions.stage.y}

                width={200}

                height={80}

                fill="#754d94"

                cornerRadius={10}

                draggable

                onClick={() => setSelectedElement("stage")}

                onTap={() => setSelectedElement("stage")}

                onDragEnd={(event) =>

                  updatePosition(

                    "stage",

                    event.target.x(),

                    event.target.y()

                  )

                }

                stroke={

                  selectedElement === "stage" ? "#ffffff" : undefined

                }

                strokeWidth={selectedElement === "stage" ? 5 : 0}

              />

              <Text

                x={positions.stage.x + 50}

                y={positions.stage.y + 30}

                text="STAGE"

                fontSize={22}

                fill="white"

                listening={false}

              />

              {showSeating && (

                <>

                  {[0, 70, 140, 210].map((offset) => (

                    <Circle

                      key={offset}

                      x={positions.seating.x + offset}

                      y={positions.seating.y}

                      radius={20}

                      fill="#9b6bb3"

                      draggable={offset === 0}

                      onClick={() => setSelectedElement("seating")}

                      onTap={() => setSelectedElement("seating")}

                      onDragEnd={(event) =>

                        updatePosition(

                          "seating",

                          event.target.x(),

                          event.target.y()

                        )

                      }

                      stroke={

                        selectedElement === "seating"

                          ? "#ffffff"

                          : undefined

                      }

                      strokeWidth={selectedElement === "seating" ? 5 : 0}

                    />

                  ))}

                  <Text

                    x={positions.seating.x + 50}

                    y={positions.seating.y + 40}

                    text="SEATING"

                    fontSize={18}

                    fill="#754d94"

                    listening={false}

                  />

                </>

              )}

              {showFood && (

                <>

                  <Rect

                    x={positions.food.x}

                    y={positions.food.y}

                    width={150}

                    height={80}

                    fill="#e6a23c"

                    cornerRadius={10}

                    draggable

                    onClick={() => setSelectedElement("food")}

                    onTap={() => setSelectedElement("food")}

                    onDragEnd={(event) =>

                      updatePosition(

                        "food",

                        event.target.x(),

                        event.target.y()

                      )

                    }

                    stroke={

                      selectedElement === "food" ? "#ffffff" : undefined

                    }

                    strokeWidth={selectedElement === "food" ? 5 : 0}

                  />

                  <Text

                    x={positions.food.x + 25}

                    y={positions.food.y + 30}

                    text="FOOD STALL"

                    fontSize={18}

                    fill="white"

                    listening={false}

                  />

                </>

              )}

              {showRegistration && (

                <>

                  <Rect

                    x={positions.registration.x}

                    y={positions.registration.y}

                    width={180}

                    height={70}

                    fill="#5f8dc9"

                    cornerRadius={10}

                    draggable

                    onClick={() => setSelectedElement("registration")}

                    onTap={() => setSelectedElement("registration")}

                    onDragEnd={(event) =>

                      updatePosition(

                        "registration",

                        event.target.x(),

                        event.target.y()

                      )

                    }

                    stroke={

                      selectedElement === "registration"

                        ? "#ffffff"

                        : undefined

                    }

                    strokeWidth={

                      selectedElement === "registration" ? 5 : 0

                    }

                  />

                  <Text

                    x={positions.registration.x + 15}

                    y={positions.registration.y + 25}

                    text="REGISTRATION"

                    fontSize={18}

                    fill="white"

                    listening={false}

                  />

                </>

              )}

              {showPhoto && (

                <>

                  <Rect

                    x={positions.photo.x}

                    y={positions.photo.y}

                    width={160}

                    height={80}

                    fill="#d86ba3"

                    cornerRadius={10}

                    draggable

                    onClick={() => setSelectedElement("photo")}

                    onTap={() => setSelectedElement("photo")}

                    onDragEnd={(event) =>

                      updatePosition(

                        "photo",

                        event.target.x(),

                        event.target.y()

                      )

                    }

                    stroke={

                      selectedElement === "photo" ? "#ffffff" : undefined

                    }

                    strokeWidth={selectedElement === "photo" ? 5 : 0}

                  />

                  <Text

                    x={positions.photo.x + 30}

                    y={positions.photo.y + 30}

                    text="PHOTO ZONE"

                    fontSize={18}

                    fill="white"

                    listening={false}

                  />

                </>

              )}

              {showRestroom && (

                <>

                  <Rect

                    x={positions.restroom.x}

                    y={positions.restroom.y}

                    width={150}

                    height={70}

                    fill="#6c9b78"

                    cornerRadius={10}

                    draggable

                    onClick={() => setSelectedElement("restroom")}

                    onTap={() => setSelectedElement("restroom")}

                    onDragEnd={(event) =>

                      updatePosition(

                        "restroom",

                        event.target.x(),

                        event.target.y()

                      )

                    }

                    stroke={

                      selectedElement === "restroom"

                        ? "#ffffff"

                        : undefined

                    }

                    strokeWidth={selectedElement === "restroom" ? 5 : 0}

                  />

                  <Text

                    x={positions.restroom.x + 35}

                    y={positions.restroom.y + 25}

                    text="RESTROOM"

                    fontSize={18}

                    fill="white"

                    listening={false}

                  />

                </>

              )}

            </Layer>

          </Stage>

          <p className="designer-hint">

            💡 Drag elements to arrange them, then click

            <strong> SAVE LAYOUT </strong>

            to save your venue design.

          </p>

        </div>

      </div>

    </div>

  );

}

export default VenueDesigner;

