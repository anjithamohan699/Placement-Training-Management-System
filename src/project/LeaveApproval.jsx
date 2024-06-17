import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import './LeaveApproval.css';
import { database } from '../Firebase';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { IoLogOutOutline } from 'react-icons/io5';
import { IoMdHome, IoMdPersonAdd } from 'react-icons/io';
import Logout from './Logout';

const LeaveApproval = () => {
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [selectedDescription, setSelectedDescription] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate =useNavigate();
  const [attachmentMessage, setAttachmentMessage] = useState('');

  useEffect(() => {
    const fetchLeaveApplications = async () => {
      try {
        const querySnapshot = await getDocs(collection(database, 'Leave'));
        const leaveData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLeaveApplications(leaveData);
      } catch (error) {
        console.error('Error fetching leave applications: ', error);
      }
    };

    fetchLeaveApplications();
  }, []);

  const handleApproveReject = async (id, status) => {
    try {
      const leaveRef = doc(database, 'Leave', id);
      await updateDoc(leaveRef, { Status: status });
      // Update local state immediately
      setLeaveApplications(prevApplications =>
        prevApplications.map(application =>
          application.id === id ? { ...application, Status: status } : application
        )
      );
    } catch (error) {
      console.error('Error updating leave status: ', error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return ''; // Handle case where timestamp is null or undefined

    // Check if timestamp is a Firestore Timestamp object
    if (timestamp.seconds && timestamp.nanoseconds) {
      const date = new Date(timestamp.seconds * 1000); // Convert Firestore Timestamp to JavaScript Date
      return date.toLocaleDateString(); // Format Date as 'MM/DD/YYYY' (or any desired format)
    }

    // If timestamp is a string or different format, handle accordingly
    const date = new Date(timestamp); // Convert to JavaScript Date (assuming timestamp is in ISO 8601 format)
    return date.toLocaleDateString(); // Format Date as 'MM/DD/YYYY' (or any desired format)
  };

  const handleViewAttachment = (attachmentUrl) => {
    if(!attachmentUrl || attachmentUrl.trim() === ""){
      alert('Attachment not uploaded');
    }else {
      // Open the attachment in a new tab
    window.open(attachmentUrl, '_blank');
  }
  };

  const handleViewDescription = (description) => {
    setSelectedDescription(description);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

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

   function handleViewStudents(){
    navigate("/studentdetails")
  }

  function handleDisplayStatistics(){
    navigate('/displaystatistics')
  }

  function handleInbox(){
    navigate('/inbox')
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

  function redirectToAdminLogout(){
    toggleModels();
  }

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
        <NavLink className='nav-lists' to='/admin'
              onClick= {redirectToAdminHome} > <IoMdHome /> Home 
            </NavLink>
        </nav>
        <nav>
        <NavLink className='nav-lists' to='/signup'
              onClick= {redirectToSignUp} > <IoMdPersonAdd /> Create Account 
            </NavLink>
        </nav>
        <nav>
              <li className="nav-lists" onClick={redirectToAdminLogout}>
                <IoLogOutOutline /> Logout
              </li>
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
    <div className="approval-container">
      <h2>LEAVE APPROVAL</h2>
      <div className='approval-table-container'>
      <table className="approval-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Batch</th>
            <th>Leave Type</th>
            <th>From Date</th>
            <th>To Date</th>
            <th>Session</th>
            <th>Reason</th>
            <th>Attachment</th>
            <th>Description</th>
            <th>Actions</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {leaveApplications.map((application, index) => (
            <tr key={index}>
                <td className='name-head'>{application.Name}</td>
                <td>{application.Batch}</td>
              <td>{application.Type}</td>
              <td>{formatDate(application.From)}</td>
              <td>{formatDate(application.on)}</td>
              <td>{application.Session}</td>
              <td>{application.Reason}</td>
              <td>
                <button className='view-attachment' onClick={() => handleViewAttachment(application.Attachment)}>View Attachment</button>
              </td>
              <td>
                <button className='view-description' onClick={() => handleViewDescription(application.Description)}>View Description</button>
              </td>
              <td className='checkbox-approval'>
                
              <label>
                  <input  className='checkbox-tick'
                    type="checkbox"
                    checked={application.Status === 'Approved'}
                    onChange={() => handleApproveReject(application.id, 'Approved')}
                  /> Approve
                </label>
                <label>
                  <input className='checkbox-tick'
                    type="checkbox"
                    checked={application.Status === 'Rejected'}
                    onChange={() => handleApproveReject(application.id, 'Rejected')}
                  /> Reject
                </label>
              </td>
              <td className={application.Status === 'Approved' ? 'approved' : 'rejected'}>
                {application.Status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      {isModalOpen && (
        <div className="modal-overlay-approval">
          <div className="modal-approvals">
            <div className="modal-header">
              <h2>Description</h2>
              <span className="close-button-approval" onClick={handleCloseModal}>×</span>
            </div>
            <div className="modal-content-approval">
              <p>{selectedDescription}</p>
            </div>
          </div>
        </div>
      )}
    </div>
    <Logout isOpened={models} closeModels={toggleModels} />
    </div>
    </>
  );
};

export default LeaveApproval;