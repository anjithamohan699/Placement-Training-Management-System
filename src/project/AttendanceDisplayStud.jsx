import React, { useState, useEffect } from 'react';
import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { useCookies } from 'react-cookie';
import './AttendanceDisplayStud.css';
import { database } from '../Firebase';
import { NavLink, useNavigate } from 'react-router-dom';
import { IoMdHome } from 'react-icons/io';
import { FaBell } from 'react-icons/fa';
import { IoLogOutOutline } from 'react-icons/io5';
import Logout from './Logout';
import UploadResume from './UploadResume';

function AttendanceDisplayStud() {

    const navigate = useNavigate();
    const [profilePictureUrl, setProfilePictureUrl] = useState(null);
    const [attendanceData, setAttendanceData] = useState([]);
    const [cookie, setCookie] = useCookies(["email"]);
    const userEmail = cookie.email;

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const querySnapshot = await getDocs(collection(database, 'Attendance'));
        const uniqueAttendanceData = {};

        querySnapshot.forEach((doc) => {
          const { attendance, session, eventName, eventDate } = doc.data();
          attendance.forEach((record) => {
            if (record.email === userEmail) {
              const key = `${eventName}`; // Unique key for event
              if (!uniqueAttendanceData[key]) {
                uniqueAttendanceData[key] = {
                  eventName: eventName,
                  eventDate: formatDate(eventDate), // Format date here
                  sessions: {},
                };
              }
              if (!uniqueAttendanceData[key].sessions[session]) {
                uniqueAttendanceData[key].sessions[session] = [];
              }
              uniqueAttendanceData[key].sessions[session].push({
                status: record.status
              });
            }
          });
        });

        setAttendanceData(Object.values(uniqueAttendanceData));
      } catch (error) {
        console.error('Error fetching attendance:', error);
      }
    };    

    if (userEmail) {
      fetchAttendance();
    }
  }, [userEmail]);

  // Function to format date into DD/MM/YYYY
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month}/${year}`;
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

  function handleAttendance(){
    navigate('/displayattendance');
  }

  function handleResult(){
    navigate('/result');
  }

  function handleApplyLeave(){
    navigate('/applyleave');
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
          <div className="sidediv"><button className="sidebutton" onClick={handleProfile}> Profile Settings</button></div>
          <div className="sidediv"><button className="sidebutton" onClick={toggleModel}>Resume</button></div>  
          <div className="sidediv"><button className="sidebutton" onClick={handleLeaveInbox}>Applied Leave(s)</button></div>
          <div className="sidediv"><button className="sidebutton" onClick={handleAttendance}>Attendance</button></div>
          <div className="sidediv"><button className="sidebutton" onClick={handleResult}>University Results</button></div>
          <div className="sidediv"><button className="sidebutton" onClick={redirectToStudentNotification}>Notification</button></div>
          <div className="sidediv"><button className="sidebutton" onClick={handleApplyLeave}>Apply For Leave</button></div>
        </div>
        
    <div className="attendance-table-container">
      <h3>ATTENDANCE</h3>
      <div className="table-wrapper">
      <table className="attendance-table-stud">
        <thead>
          <tr>
            <th className='eventName-head'>Event Name</th>
            <th>Event Date</th>
            <th>Session 1</th>
            <th>Session 2</th>
            <th>Session 3</th>
          </tr>
        </thead>
        <tbody>
          {attendanceData.map((attendance, index) => (
            <tr key={index}>
              <td>{attendance.eventName}</td>
              <td>{attendance.eventDate}</td>
              <td>{attendance.sessions['session1'] && attendance.sessions['session1'].map((attendee, idx) => (
                    <span key={idx}>{attendee.status}</span>
                  ))}
              </td>
              <td>{attendance.sessions['session2'] && attendance.sessions['session2'].map((attendee, idx) => (
                    <span key={idx}>{attendee.status}</span>
                  ))}
              </td>
              <td>{attendance.sessions['session3'] && attendance.sessions['session3'].map((attendee, idx) => (
                    <span key={idx}>{attendee.status}</span>
                  ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
    <UploadResume isOpen={model} closeModel={toggleModel} />
    <Logout isOpened={models} closeModels={toggleModels} /> 
    </div>
    </>
  );
}

export default AttendanceDisplayStud;

	
