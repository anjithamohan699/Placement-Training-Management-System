import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import './Inbox.css';
import { FaTrash, FaEye } from 'react-icons/fa';
import { database , storage } from '../Firebase';
import { NavLink, useNavigate } from 'react-router-dom';
import { IoMdHome, IoMdPersonAdd } from 'react-icons/io';
import { IoLogOutOutline } from 'react-icons/io5';
import Logout from "./Logout";
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const Inbox = () => {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [displayedNotifications, setDisplayedNotifications] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(database, 'admin_notification'), (snapshot) => {
      const updatedNotifications = snapshot.docs.map(doc => ({
        id: doc.id,
        description: doc.data().description,
        date: doc.data().date,
        attachmentUrl: doc.data().attachmentUrl, // Include attachmentUrl in the object
        // Add other fields here as needed
      }));
      setNotifications(updatedNotifications);
      setDisplayedNotifications(showMore ? updatedNotifications : updatedNotifications.slice(0, 3));
    });

    // Clean up subscription
    return () => unsubscribe();
  }, [showMore]);

  const handleDeleteNotification = async (notificationId) => {
    // Ask for confirmation
    const confirmDelete = window.confirm("Are you sure you want to delete the notification?");

    if (confirmDelete) {
      // Delete notification from Firestore
      try {
        await deleteDoc(doc(database, 'admin_notification', notificationId));
        alert('Notification deleted successfully');
      } catch (error) {
        console.error('Error deleting notification:', error);
        alert('Failed to delete notification');
      }
    }
  };

  const handleViewNotificationDetails = (notification) => {
    setSelectedNotification(notification);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedNotification(null);
  };

  const handleViewMore = () => {
    setShowMore(true);
  };

  const navigate = useNavigate();

  function redirectToSignUp() {
    navigate("/signup");
  }

  function redirectToAdminHome() {
    navigate("/admin");
  }

  function redirectToAdminLogout() {
    toggleModels();
  }

  function handleAddNoti() {
    navigate("/admin-notification");
  }

  function handleLeaveApproval() {
    navigate("/leaveapproval");
  }

  function handleViewStudents() {
    navigate("/studentdetails");
  }

  function handleDisplayStatistics() {
    navigate('/displaystatistics');
  }

  function handleInbox() {
    navigate('/inbox');
  }

  const [showPopup, setShowPopup] = useState(false);
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventAttachment, setEventAttachment] = useState(null); // Store file object
  const [uploading, setUploading] = useState(false); // State to track uploading status

  const handleAddEvent = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleEventNameChange = (e) => {
    setEventName(e.target.value);
  };

  const handleEventDateChange = (e) => {
    setEventDate(e.target.value);
  };

  const handleEventAttachmentChange = (e) => {
    // Get the selected file
    const file = e.target.files[0];
    setEventAttachment(file);
  };

  const handleSubmit = async () => {
    // Close the popup
    setShowPopup(false);

    // Set uploading status to true
    setUploading(true);

    // Upload file to Firebase Storage
    let attachmentUrl = "";
    if (eventAttachment) {
      const attachmentRef = ref(storage, `event_attachments/${eventAttachment.name}`);
      const uploadTask = uploadBytesResumable(attachmentRef, eventAttachment);

      uploadTask.on('state_changed',
        () => {},
        (error) => {
          console.error("Error uploading attachment: ", error);
          // Set uploading status to false in case of error
          setUploading(false);
        },
        () => {
          // Upload completed successfully, get download URL
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            console.log('File available at', downloadURL);
            attachmentUrl = downloadURL;

            // Create a new document in the "events" collection
            addEventToFirestore(attachmentUrl);
          });
        }
      );
    } else {
      // If no attachment, directly add event to Firestore
      addEventToFirestore("");
    }
  };

  const addEventToFirestore = async (attachmentUrl) => {
    try {
      const docRef = await addDoc(collection(database, "Events"), {
        eventName: eventName,
        eventDate: eventDate,
        eventAttachment: attachmentUrl
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (error) {
      console.error("Error adding document: ", error);
    }

    // Clear input fields and reset uploading status
    setEventName("");
    setEventDate("");
    setEventAttachment(null);
    setUploading(false);
  };

  const [models, setModels] = useState(false);
  const toggleModels = () => {
    setModels(!models);
  };

  return (
    <>
      <div className="navbar1">
        <div className="first-portion1">
          <div className="logo1">
            <label>ALBERTIAN INSTITUTE OF SCIENCE AND TECHNOLOGY (AISAT)</label>
          </div>
        </div>

        <ul>
          <div className="last-portion1">
            <nav>
              <NavLink className='nav-lists' to='/admin' onClick={redirectToAdminHome}> <IoMdHome /> Home </NavLink>
            </nav>
            <nav>
              <NavLink className='nav-lists' to='/signup' onClick={redirectToSignUp}> <IoMdPersonAdd /> Create Account </NavLink>
            </nav>
            <nav>
              <li className="nav-lists" onClick={redirectToAdminLogout}> <IoLogOutOutline /> Logout </li>
            </nav>
          </div>
        </ul>
      </div>
      <div className="outer-div">
        <div className="sidebar">
          <div className="image-admin">
            <img  
              className="admin-img"
              src="https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-portrait-176256935.jpg"
            ></img>
          </div>
          <div className="sidediv">
            <button className="Sidebutton" onClick={handleAddNoti}>Send Notification</button>
          </div>
          <div className="sidediv">
            <button className="Sidebutton" onClick={handleAddEvent}>
              Add Event
            </button>
            {showPopup && (
              <div className="modal-calendar">
                <div className="modal-content-calendar">
                  <span className="close-calendar" onClick={handleClosePopup}>&times;</span>
                  <h2>ADD EVENT</h2>
                  <label>Event Name:</label>
                  <input
                  className='eventname-input'
                    type="text"
                    value={eventName}
                    onChange={handleEventNameChange}
                  />
                  <label>Event Date:</label>
                  <input
                  className='eventname-input'
                    type="date"
                    value={eventDate}
                    onChange={handleEventDateChange}
                  />
                  <label>Attachment:</label>
                  <input className='eventname-input'
                    type="file"
                    onChange={handleEventAttachmentChange}
                  />
                  {uploading && <p>Uploading...</p>}
                  <div className="button-container-calendar">
                    <button onClick={handleSubmit}>Submit</button>
                    <button onClick={handleClosePopup}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="sidediv">
            <button className="Sidebutton" onClick={handleLeaveApproval}>Leave Approval</button>
          </div>
          <div className="sidediv">
            <button className="Sidebutton" onClick={handleDisplayStatistics}>Statistics</button>
          </div>
          <div className="sidediv">
            <button className="sidebutton" onClick={handleInbox}>Inbox</button>
          </div>
          <div className="sidediv">
            <button className="Sidebutton" onClick={handleViewStudents}>View Students</button>
          </div>
        </div>
      </div>
      <div className="notifications-display-container">
        <h3 className='noti-h3'>INBOX</h3>
        <div className="notification-list">
          {displayedNotifications.map((notification) => (
            <div key={notification.id} className="notification-box">
              <div className="date">{notification.date}</div>
              <div className='descp-inbox'><h3>{notification.description}</h3></div>
              <button className="view-details-button" onClick={() => handleViewNotificationDetails(notification)}>
                <FaEye />
              </button>
              <button className="delete-button" onClick={() => handleDeleteNotification(notification.id)}>
                <FaTrash />
              </button>
            </div>
          ))}
          {!showMore && notifications.length > 3 && (
            <button className="view-more-button" onClick={handleViewMore}>
              View more
            </button>
          )}
        </div>
        {showModal && selectedNotification && (
          <div className="overlay-inbox">
            <div className="modal-inbox">
              <span className="inbox-close" onClick={handleCloseModal}>×</span>
              <h2 >Notification Details</h2>
              <p>{selectedNotification.description}</p>
              {/* Display attachment option if attachmentUrl exists */}
              {selectedNotification.attachmentUrl && (
                <div className="attachment-section">
                  <a href={selectedNotification.attachmentUrl} target="_blank" rel="noopener noreferrer">
                    View Attachment
                  </a>
                </div>
              )}
              {/* Add other details here as needed */}
            </div>
          </div>
        )}
        <Logout isOpened={models} closeModels={toggleModels} />
      </div>
    </>
  );
};

export default Inbox;
