import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { storage, database } from '../Firebase';
import './AdminNotification.css';
import { NavLink, useNavigate } from 'react-router-dom';
import { IoMdHome, IoMdPersonAdd } from 'react-icons/io';
import { IoLogOutOutline } from 'react-icons/io5';
import Logout from './Logout';
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

const AdminNotification = () => {
  const [notificationDescription, setNotificationDescription] = useState('');
  const [recipient, setRecipient] = useState('');
  const [notificationDate, setNotificationDate] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [recipientError, setRecipientError] = useState('');
  const [dateError, setDateError] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleAddNotification = async (e) => {
    e.preventDefault();

    setDescriptionError('');
    setRecipientError('');
    setDateError('');

    let isValid = true;
    if (notificationDescription.trim() === '') {
      setDescriptionError('* Required to fill this field');
      isValid = false;
    }
    if (recipient.trim() === '') {
      setRecipientError('* Required to fill this field');
      isValid = false;
    }
    if (notificationDate.trim() === '') {
      setDateError('* Required to fill this field');
      isValid = false;
    }

    if (!isValid) {
      alert('Please fill all the required fields.');
      return;
    }

    try {
      let attachmentUrl = "";
      if (file) {
        const attachmentRef = ref(storage, `admin-attach/${file.name}`);
        const uploadTask = uploadBytesResumable(attachmentRef, file);

        uploadTask.on(
          'state_changed',
          () => {},
          (error) => {
            console.error("Error uploading attachment: ", error);
            setUploading(false);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('File available at', downloadURL);
            attachmentUrl = downloadURL;

            await addDoc(collection(database, 'admin_notification'), {
              date: notificationDate,
              description: notificationDescription,
              recipient: recipient,
              attachmentUrl: attachmentUrl
            });
          }
        );
      } else {
        await addDoc(collection(database, 'admin_notification'), {
          date: notificationDate,
          description: notificationDescription,
          recipient: recipient,
          attachmentUrl: ""
        });
      }

      alert('Notification sent successfully!');

      setNotificationDescription('');
      setRecipient('');
      setNotificationDate('');
    } catch (error) {
      console.error('Error adding notification to Firestore: ', error);
      alert('An error occurred. Please try again later.');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFile(file);
  };

  const handleDescriptionChange = (e) => {
    setNotificationDescription(e.target.value);
    setDescriptionError('');
  };

  const handleRecipientChange = (e) => {
    setRecipient(e.target.value);
    setRecipientError('');
  };

  const handleDateChange = (e) => {
    setNotificationDate(e.target.value);
    setDateError('');
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
    navigate("/leaveapproval")
  }

  function handleViewStudents() {
    navigate("/studentdetails")
  }

  function handleInbox() {
    navigate("/inbox")
  }

  function handleDisplayStatistics() {
    navigate('/displaystatistics')
  }

  const [showPopup, setShowPopup] = useState(false);
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventAttachment, setEventAttachment] = useState(null); // Store file object

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
    const file = e.target.files[0];
    setEventAttachment(file);
  };

  const handleSubmit = async () => {
    setShowPopup(false);

    let attachmentUrl = "";
    if (eventAttachment) {
      const attachmentRef = ref(storage, `event_attachments/${eventAttachment.name}`);
      const uploadTask = uploadBytesResumable(attachmentRef, eventAttachment);

      uploadTask.on('state_changed',
        () => {},
        (error) => {
          console.error("Error uploading attachment: ", error);
          setUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log('File available at', downloadURL);
          attachmentUrl = downloadURL;

          addEventToFirestore(attachmentUrl);
        }
      );
    } else {
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
              alt="Admin Avatar"
            />
          </div>
          <div className="sidediv">
            <button className="Sidebutton" onClick={handleAddNoti}>Send Notification</button>
          </div>
          <div className="sidediv">
            <button className="Sidebutton" onClick={handleAddEvent}>Add Event</button>
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
                  <input
                  className='eventname-input'
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
            <button className="Sidebutton" onClick={handleInbox}>Inbox</button>
          </div>
          <div className="sidediv">
            <button className="Sidebutton" onClick={handleViewStudents}>View Students</button>
          </div>
        </div>

        <form onSubmit={handleAddNotification} className="notification-form">
          <label className='add-noti-label'>ADD NOTIFICATION</label>
          <div className="form-group">
            <label htmlFor="notificationDate">Notification Date: *</label>
            <input type="date" id="notificationDate" value={notificationDate} onChange={handleDateChange} />
            {dateError && <p className="error">{dateError}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="notificationDescription">Notification Description: *</label>
            <textarea
              type="text"
              id="notificationDescription"
              value={notificationDescription}
              onChange={handleDescriptionChange}
            ></textarea>
            {descriptionError && <p className="error">{descriptionError}</p>}
          </div>
          <div className='form-group'>
            <label htmlFor="file">Attach File:</label>
            <input type="file" id="attachfile" onChange={handleFileChange} />
          </div>
          <div className="form-group">
            <label htmlFor="recipient">Recipient: *</label>
            <select className="recipient" value={recipient} onChange={handleRecipientChange}>
              <option value="">--Select--</option>
              <option value="faculty">P&T Coordinator</option>
            </select>
            {recipientError && <p className="error">{recipientError}</p>}
          </div>
          <button type="submit" className="add-notification">Send Notification</button>
        </form>
        <Logout isOpened={models} closeModels={toggleModels} />
      </div>
    </>
  );
};

export default AdminNotification;
