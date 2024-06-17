import React, { useState, useEffect } from 'react';
import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import './LeaveInbox.css'; 
import { database } from '../Firebase';
import { NavLink, useNavigate } from 'react-router-dom';
import { IoIosNotifications, IoMdHome } from 'react-icons/io';
import { IoLogOutOutline } from 'react-icons/io5';
import { useCookies } from 'react-cookie';
import { FaBell } from 'react-icons/fa';
import UploadResume from './UploadResume';
import Logout from './Logout';

const LeaveInbox = () => {

  const navigate = useNavigate();
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const [cookie, setCookie] = useCookies(["email"]);

  useEffect(() => {
    const fetchLeaveApplications = async () => {
      try {
        // Adjusted query to filter based on the user's email
        const querySnapshot = await getDocs(query(collection(database, 'Leave') , where("email", "==" , cookie.email)));
        const leaveData = querySnapshot.docs.map(doc => doc.data());
        setLeaveApplications(leaveData);
      } catch (error) {
        console.error('Error fetching leave applications: ', error);
      }
    };

    fetchLeaveApplications();
  }, [cookie.email]);  // Added cookie.email as a dependency to re-fetch when it changes

  const handleViewDescription = (description) => {
    setSelectedDescription(description);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  function redirectToStudentNotification(){
    navigate('/studentnotificationdisplay')
  }

  function redirectToStudentHome(){
    navigate('/student');
  }

  function redirectToStudentLogout(){
    toggleModels();
  }

  function handleProfile(){
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

  function handleAttendance(){
    navigate('/displayattendance');
  }

  function redirectToStudentNotification(){
    navigate('/studentnotificationdisplay')
  }

  const [model, setModel] = useState(false);
  const toggleModel = () => {
    setModel(!model);
  };

  const [models, setModels] = useState(false);
  const toggleModels = () => {
    setModels(!models);
  };

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

  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0); // Add state for notification count

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(database, 'faculty_notification'), (snapshot) => {
      const updatedNotifications = snapshot.docs.map(doc => doc.data());
      setNotifications(updatedNotifications);

      // Update notification count based on unviewed notifications
      const unviewedNotifications = updatedNotifications.filter(notification => !notification.viewed);
      setNotificationCount(unviewedNotifications.length);
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
    <div className="navbar">
        <div className="first-portion">
          <div className="logo">
            <label>ALBERTIAN INSTITUTE OF SCIENCE AND TECHNOLOGY (AISAT)</label>
          </div>
        </div>
        
        <ul>
          <div className='last-portions'>
            <nav>
              <NavLink className='nav-list' to='/student' onClick={redirectToStudentHome}>
                <IoMdHome /> Home 
              </NavLink>
            </nav>
            <nav>
              <NavLink className='nav-list' to='/studentnotificationdisplay' 
              onClick= {redirectToStudentNotification} > 
              <div className="bell-icon-containers">
                  <FaBell className="bell-icons" />
                  {notificationCount > 0 && (
            <span className="notification-counts">{notificationCount}</span>
              )}
                </div>
                  Notification 
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
          <div className="sidediv"><button className="sidebutton" onClick={handleProfile}>Profile Settings</button></div>
          <div className="sidediv"><button className="sidebutton" onClick={toggleModel}>Resume</button></div>  
          <div className="sidediv"><button className="sidebutton" onClick={handleLeaveInbox}>Applied Leave(s)</button></div>
          <div className="sidediv"><button className="sidebutton" onClick={handleAttendance}>Attendance</button></div>
          <div className="sidediv"><button className="sidebutton" onClick={handleResult}>University Results</button></div>
          <div className="sidediv"><button className="sidebutton" onClick={redirectToStudentNotification}>Notification</button></div>
          <div className="sidediv"><button className="sidebutton" onClick={handleApplyLeave}>Apply For Leave</button></div>
        </div>

    <div className="inbox-container">
      <h2>LEAVE INBOX</h2>
      <div className="table-box">
      <div className='leave-table-div'>
      <table className="leave-table">
        <thead>
          <tr>
            <th>Leave Type</th>
            <th>From Date</th>
            <th>To Date</th>
            <th>Session</th>
            <th>Reason</th>
            <th>Description</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {leaveApplications.map((application, index) => (
            <tr key={index}>
              <td>{application.Type}</td>
              <td>{new Date(application.From).toLocaleDateString()}</td>
              <td>{new Date(application.on).toLocaleDateString()}</td>
              <td>{application.Session}</td>
              <td>{application.Reason}</td>
              <td><button className='view-description' onClick={() => handleViewDescription(application.Description)}>View Description</button></td>
              <td className={application.Status === 'Approved' ? 'approved' : 'rejected'}>
                {application.Status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      </div>
      {isModalOpen && (
        <div className="modal-overlay-leave-inbox">
          <div className="modal-approvals-inbox">
            <div className="modal-header-inbox">
              <h2>Description</h2>
              <span className="close-button-approval-inbox" onClick={handleCloseModal}>×</span>
            </div>
            <div className="modal-content-approval-inbox">
              <p>{selectedDescription}</p>
            </div>
          </div>
        </div>
      )}
    </div>
    <UploadResume isOpen={model} closeModel={toggleModel} />
    <Logout isOpened={models} closeModels={toggleModels} />
    </div>
    </>
  );
};

export default LeaveInbox;