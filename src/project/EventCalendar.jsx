import { addDoc, collection, doc, getDoc, getDocs, onSnapshot } from "firebase/firestore";
import "react-calendar/dist/Calendar.css";
import { Calendar } from "react-calendar";
import { useEffect, useState } from "react";
import { database } from "../Firebase";

function EventCalendar() {

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsCollection = collection(database, 'Events');
        const eventsSnapshot = await getDocs(eventsCollection);
        const eventsData = eventsSnapshot.docs.map(doc => doc.data());
        setEvents(eventsData);
      } catch (error) {
        console.error("Error fetching events: ", error);
      }
    };

    const unsubscribe = onSnapshot(collection(database, 'Events'), (snapshot) => {
      const updatedEvents = snapshot.docs.map(doc => doc.data());
      setEvents(updatedEvents);
    });

    return () => unsubscribe(); // Cleanup function to unsubscribe from the snapshot listener
  }, []);


  const handleDateClick = (clickedDate) => {
    const clickedEvents = events.filter(event => {
      const eventDate = new Date(event.eventDate);
      return (
        eventDate.getDate() === clickedDate.getDate() &&
        eventDate.getMonth() === clickedDate.getMonth() &&
        eventDate.getFullYear() === clickedDate.getFullYear()
      );
    });

    if (clickedEvents.length > 0) {
      setSelectedEvent(clickedEvents[0]); // For simplicity, just pick the first event
      setShowModal(true);
    } else {
      setSelectedEvent(null);
      setShowModal(false);
    }
  };

  const handleClosePopup = () => {
    setSelectedEvent(null);
    setShowModal(false);
  };

  const handleDownloadAttachment = async () => {
    if (selectedEvent && selectedEvent.eventAttachment) {
      setDownloading(true); // Start downloading
      try {
        const response = await fetch(selectedEvent.eventAttachment);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "attachment.pdf");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link); // Clean up
      } catch (error) {
        console.error("Error downloading attachment: ", error);
      }
      setDownloading(false); // Download complete
    }
  };

  return (
    <>
      <div className="container-cal">
        <style>
          {`
          .container-cal {
                width: 1160px;
                height: 320px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                position: absolute;
                margin-left:352px;
                margin-top: 200px;
            }

          .date-container {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }

          .event-message {
            font-size: 0.8rem;
            color: #555;
          }

          .calendar-container {
            width: 300rem;
            height: 70vh;
            top:-500px;
            border-color: rgb(206, 204, 204);
          }

            .addevent{
                width: 7rem;
                height: 2rem;
                border-radius: 0;
                background-color: black;
                color: white;
            } 
            
            .event-message{
                border-radius: 0.5rem;
                background-color: green;
                color: white;
            }

            button{
              color:black;
              border-radius:0;
            }
              
        `}
        </style>
        <Calendar className="calendar-container"
        onClickDay={handleDateClick}
        tileContent={({ date, view }) =>
        view === "month" &&
        events.map((event, index) => {
          const eventDate = new Date(event.eventDate);
          if (
            eventDate.getDate() === date.getDate() &&
            eventDate.getMonth() === date.getMonth() &&
            eventDate.getFullYear() === date.getFullYear()
          ) {
            return (
              <div key={index} className="date-container">
                  <span className="event-message">{event.eventName}</span>
              </div>
            );
          }
          return null;
        })
      }
    />
  </div>
  {selectedEvent && (
      <>
        <div className={`overlayss ${showModal ? "show" : ""}`} onClick={handleClosePopup}></div>
        <div className={`popup ${showModal ? "show" : ""}`}>
          <style>
          {`
            .popup {
              position: fixed;
              top: 15%;
              left: 50%;
              transform: translate(-50%, -50%);
              background-color: white;
              padding: 20px;
              border: 1px solid #ccc;
              border-radius: 5px;
              z-index: 1000;
              max-width: 400px;
              width: 100%;
            }

            .popup h3 {
              margin-top: 0;
              font-family: Arial, Helvetica, sans-serif;
            }

            .popup p {
              margin: 10px 0;
              font-family: Arial, Helvetica, sans-serif;
            }

            .popup button {
              margin-top: 10px;
              padding: 8px 16px;
              background-color: #043565;
              color: white;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              font-family: Arial, Helvetica, sans-serif;
            }

            .close-events-modal{
              margin-left: 398px;
              font-size: 25px;
              float: right;
              margin-top: -12px;
              cursor: pointer;
            }

            .popup button:hover {
              background-color: #333;
            }

            .popup button:disabled {
              background-color: #ccc;
              cursor: not-allowed;
            }

            .overlayss {
              display: none;
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent black background */
              z-index: 999; /* Ensure overlay is below popup */
            }
            
            .overlayss.show {
              display: block; /* Show the overlay when showModal state is true */
            }

            .view-events-button{
              margin-left: 0;
              margin-bottom: 20px;
            }

          `}
          </style>
          <span className="close-events-modal" onClick={handleClosePopup}>&times;</span>
          <h3>{selectedEvent.eventName}</h3>
          <p>Date: {selectedEvent.eventDate}</p>
          {selectedEvent.eventAttachment && (
            <div>
              <button className="view-events-button" disabled={downloading} onClick={handleDownloadAttachment}>
                {downloading ? "Downloading..." : "View Details"}
              </button>
            </div>
          )}
        </div>
      </>
    )}
  </>
  );
}

export default EventCalendar;

