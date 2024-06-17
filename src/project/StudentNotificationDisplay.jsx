import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import './StudentNotificationDisplay.css';
import { FaBell, FaEye } from 'react-icons/fa';
import { auth, database } from '../Firebase';
import { useNavigate, NavLink } from 'react-router-dom';
import { IoLogOutOutline } from 'react-icons/io5';
import { IoMdHome } from 'react-icons/io';
import { useCookies } from 'react-cookie';
import Logout from './Logout';
import UploadResume from './UploadResume';

function StudentNotificationDisplay() {
  const [cookie, setCookies] = useCookies(["email"]);
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);

  const formatDate = (timestamp) => {
    if (!timestamp) return '';

    if (timestamp.seconds && timestamp.nanoseconds) {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleDateString();
    }

    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  function fetchNotifications() {
    const user = auth.currentUser;
    if (user) {
      const userEmail = user.email;
      const notificationsCollection = collection(database, 'faculty_notification');
      const notificationsQuery = query(notificationsCollection, where('studentsToNotify', 'array-contains', userEmail));
  
      getDocs(notificationsQuery)
        .then((notificationsSnapshot) => {
          const fetchedNotifications = notificationsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          fetchedNotifications.sort((a, b) => (a.viewed === b.viewed ? 0 : a.viewed? 1: -1));
          setNotifications(fetchedNotifications);
  
          const unviewedNotifications = fetchedNotifications.filter((notification) => !notification.viewed);
          setNotificationCount(unviewedNotifications.length);
        })
        .catch((error) => {
          console.error('Error fetching notifications:', error);
        });
    }
  }
  
  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleViewNotification = (notification) => {
    setSelectedNotification(notification);
    setShowModal(true);
  
    const notificationRef = doc(database, 'faculty_notification', notification.id);
    updateDoc(notificationRef, {
      viewed: true
    })
      .then(() => {
        console.log("Notification viewed status updated successfully");
        fetchNotifications();
      })
      .catch((error) => {
        console.error("Error updating notification viewed status: ", error);
      });
  };  

  const handleCloseModal = () => {
    setSelectedNotification(null);
    setShowModal(false);
  };

  const [model, setModel] = useState(false);
  const toggleModel = () => {
    setModel(!model);
  };

  const [models, setModels] = useState(false);
  const toggleModels = () => {
    setModels(!models);
  };

  const navigate = useNavigate();

  function redirectToStudentNotification() {
    navigate('/studentnotificationdisplay');
  }

  function redirectToStudentHome() {
    navigate('/student');
  }

  function redirectToStudentLogout() {
    toggleModels();
  }

  function handleAttendance(){
    navigate('/displayattendance');
  }

  function handleProfile() {
    navigate('/studentprofile');
  }

  function handleLeaveInbox(){
    navigate('/leaveinbox');
  }

  function handleResult(){
    navigate('/result');
  }

  function handleApplyLeave(){
    navigate('/applyleave');
  }

  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const querySnapshot = await getDocs(query(collection(database, "students"), where("email", "==", cookie.email)));
        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          if (userData.profilePictureUrl) {
            setProfilePictureUrl(userData.profilePictureUrl);
          }
        });
      } catch (error) {
        console.error("Error fetching profile picture:", error);
      }
    };

    if (cookie.email) {
      fetchProfilePicture();
    }
  }, [cookie.email]);

  return (
    <>
      <div className="navbar">
        <div className="first-portion">
          <div className="logo">
            <label>ALBERTIAN INSTITUTE OF SCIENCE AND TECHNOLOGY (AISAT)</label>
          </div>
        </div>
        <ul>
          <div className='last-portion'>
            <nav>
              <NavLink className='nav-list' to='/student' onClick={redirectToStudentHome}>
                <IoMdHome /> Home
              </NavLink>
            </nav>
            <nav>
              <NavLink className='nav-list' to='/studentnotificationdisplay' onClick={redirectToStudentNotification}>
                <div className="bell-icon-container">
                  <FaBell className="bell-icon" />
                  {notificationCount > 0 && (
                    <span className="notification-count">{notificationCount}</span>
                  )}
                </div>Notification
              </NavLink>
            </nav>
            <nav>
              <li className="nav-list" onClick={redirectToStudentLogout}>
                <IoLogOutOutline /> Logout
              </li>
            </nav>
          </div>
        </ul>
      </div>

      <div className='outer-container'>
        <div className="sidebar">
          <div className='image-stud'>
            {profilePictureUrl ? (
              <img className='stud-img' src={profilePictureUrl} alt='Profile' />
            ) : (
              <img className='stud-img' src='https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-portrait-176256935.jpg' alt='Default Profile' />
            )}
          </div>
          <div className="sidediv">
            <button className="sidebutton" onClick={handleProfile}> Profile Settings</button>
          </div>
          <div className="sidediv">
            <button className="sidebutton" onClick={toggleModel}>Resume</button>
          </div>  
          <div className="sidediv">
            <button className="sidebutton" onClick={handleLeaveInbox}>Applied Leave(s)</button>
          </div>
          <div className="sidediv">
            <button className="sidebutton" onClick={handleAttendance}>Attendance</button>
          </div>
          <div className="sidediv">
            <button className="sidebutton" onClick={handleResult}>University Results</button>
          </div>
          <div className="sidediv">
            <button className="sidebutton" onClick={redirectToStudentNotification}>Notification</button>
          </div>
          <div className="sidediv">
            <button className="sidebutton" onClick={handleApplyLeave}>Apply For Leave</button>
          </div>
        </div>
        <div className="studNoti-container">
          <div className='noti-inbox-head'>
          <label>NOTIFICATION FROM P&T COORDINATOR</label>
          </div>
          <div className="studNoti-notification-list">
            {notifications.map((notification) => (
              <div key={notification.id} className={`studNoti-notification-item ${notification.viewed ? 'viewed' : 'unviewed'}`}>
                <p className='date-para'>{formatDate(notification.timestamp)}</p>
                <p className='description-para'>{notification.description}</p>
                <button className="studNoti-view-details-button" onClick={() => handleViewNotification(notification)}>
                  <FaEye />
                </button>
              </div>
            ))}
          </div>
          {showModal && selectedNotification && (
            <div className="studNoti-modal-overlay" onClick={handleCloseModal}>
              <div className="studNoti-modal-content" onClick={(e) => e.stopPropagation()}>
                <span className="studNoti-close-button" onClick={handleCloseModal}>×</span>
                <h3>Description</h3>
                <p> {selectedNotification.description}</p>
                {selectedNotification.attachmentUrl && (
                  <div className="studNoti-attachment-section">
                    <a href={selectedNotification.attachmentUrl} target="_blank" rel="noopener noreferrer">
                      View Attachment
                    </a>
                  </div>
                )}              
              </div>
            </div>
          )}
        </div>
        <UploadResume isOpen={model} closeModel={toggleModel} />
        <Logout isOpened={models} closeModels={toggleModels} /> 
      </div>
    </>
  );
}

export default StudentNotificationDisplay;
