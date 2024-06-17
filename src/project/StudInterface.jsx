//StudentInterface.jsx
import "./StudInterface.css";
import { IoMdHome , IoIosNotifications } from "react-icons/io";
import { IoLogOutOutline } from "react-icons/io5";
import { Link, NavLink, useNavigate } from 'react-router-dom';
import React ,{ useState, useEffect } from "react";
import EventCalendar from "./EventCalendar";
import UploadResume from "./UploadResume";
import Logout from "./Logout";
import { useCookies } from "react-cookie";
import { collection, getDocs, onSnapshot, query, where } from "firebase/firestore";
import { database } from "../Firebase";
import { FaBell } from "react-icons/fa";

function StudInterface(props) {

  const navigate = useNavigate();
  const [cookie, setCookies] = useCookies(["email"]);
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);

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
        <div className='top-div'>
          <li className='lists'>
            <Link to='/studentnotificationdisplay'>Notification</Link>
          </li>
          <li className='lists'>
            <Link to='/displayattendance'>Attendance</Link>
          </li>
          <li className='lists'>
            <Link to='/applyleave'>Apply For Leave</Link>
          </li>
        </div>
        <EventCalendar />
        <UploadResume isOpen={model} closeModel={toggleModel} />
        <Logout isOpened={models} closeModels={toggleModels} /> 
      </div>
    </>
  );
}

export default StudInterface;
