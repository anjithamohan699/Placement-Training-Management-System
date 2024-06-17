import React, { useState } from 'react';
import './ApplyLeave.css';
import 'firebase/firestore';
import { addDoc, collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { IoMdHome , IoIosNotifications } from "react-icons/io";
import { IoLogOutOutline } from "react-icons/io5";
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { database ,storage} from './../Firebase';
import UploadResume from "./UploadResume";
import { getDownloadURL, uploadBytes } from 'firebase/storage';
import { ref } from 'firebase/storage';
import { useCookies } from 'react-cookie';
import { useEffect } from 'react';
import Logout from './Logout';
import { FaBell } from 'react-icons/fa';

const ApplyLeave = (props) => {
  
  const [cookie, setCookie] = useCookies(["email"]);
  const [activeTab,setActiveTab] = useState("Home");
  const [userData, setUserData] = useState([]);
  const navigate =useNavigate();

  function redirectToStudentHome(){
    navigate('/student')
  }

  function redirectToStudentLogout(){
    toggleModels();
  }

  function handleProfile(){
    navigate('/studentprofile')
  }

  const docRef = useState();
  const [loading, setLoading] = useState(false);
  const [leaveType, setLeaveType] = useState('');
  const [leaveOn, setLeaveOn] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [session, setSession] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveDescription, setLeaveDescription] = useState('');
  const [attachment, setAttachment] = useState('');
  const [eventDates, setEventDates] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Upload attachment
      let attachmentUrl = " ";
      if(attachment){
      const fileRef = ref(storage,`attachments/${Date.now()}_${attachment.name}`);
      await uploadBytes(fileRef, attachment);
      attachmentUrl = await getDownloadURL(fileRef);
      }
      // Get user data
      const userDataObj = userData[0]; // Assuming there's only one user data object
      const { name, batch ,email} = userDataObj;

      // Add leave application to Firestore
      await addDoc(collection(database, 'Leave'), {
        Name: name,
        Batch: batch,
        Type: leaveType,
        From: fromDate,
        on: leaveOn,
        Session: session,
        Reason: leaveReason,
        Description: leaveDescription,
        Attachment: attachmentUrl,
        email: email,
      });

      // Reset form fields after submission
      setLeaveType('');
      setFromDate('');
      setLeaveOn('');
      setSession('');
      setLeaveReason('');
      setLeaveDescription('');
      setAttachment('');

      document.getElementById('attachment').value='';
      
      alert('Leave application submitted successfully!');
    } catch (error) {
      console.error('Error submitting leave application: ', error);
      alert('Failed to submit leave application. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  function handleAttendance(){
    navigate('/displayattendance');
  }

  function redirectToStudentNotification(){
    navigate('/studentnotificationdisplay')
  }

  function handleLeaveInbox(){
    navigate('/leaveinbox')
  }

  function handleApplyLeave(){
    navigate('/applyleave');
  }

  function handleResult(){
    navigate('/result');
  }

  const [model, setModel] = React.useState(false)
  const toggleModel = () => {
    setModel(!model)
  }

  const [models, setModels] = useState(false);
  const toggleModels = () => {
    setModels(!models);
  };

  useEffect(() => {
    const fetchDataFromFirestore = async () => {
      const querySnapshot = await getDocs(query(collection(database, 'students'), where('email', '==', cookie.email)));
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setUserData(data);
    };

    if (cookie.email) {
      fetchDataFromFirestore();
    }
  }, [cookie.email]);

  const handleInputChange = (index, fieldName, e) => {
    const newUserData = [...userData];
    newUserData[index][fieldName] = e.target.value;
    setUserData(newUserData);
  };

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

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsSnapshot = await getDocs(collection(database, 'Events'));
        const dates = eventsSnapshot.docs.map(doc => {
          const eventData = doc.data();
          // Check if eventDate field exists and is a valid date string
          if (eventData.eventDate && typeof eventData.eventDate === 'string') {
            // Convert date string to JavaScript Date object
            return new Date(eventData.eventDate);
          } else {
            console.error(`Invalid event data for document with ID ${doc.id}`, eventData);
            return null;
          }
        });
        // Filter out null values (invalid event data)
        setEventDates(dates.filter(date => date !== null));
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

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
            <NavLink className='nav-list' to='/student' onClick={redirectToStudentHome}> <IoMdHome /> Home </NavLink>
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
    <div className='leave-div'>
      <div className="sidebar">
        <div className='image-stud'>
        {profilePictureUrl ? (
              <img className='stud-img' src={profilePictureUrl} alt='Profile' />
            ) : (
              <img className='stud-img' src='https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-portrait-176256935.jpg' alt='Default Profile' />
            )}
        </div>
        <div className="sidediv"><button className="sidebutton" onClick={handleProfile}> Profile Settings</button></div>
        <div className="sidediv"><button className="sidebutton" onClick={toggleModel} >Resume</button></div>
        <div className="sidediv"><button className="sidebutton" onClick={handleLeaveInbox} >Applied Leave(s)</button></div>
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
    <div className='leave-container'>
    <form onSubmit={handleSubmit}>
      <div>
        <h3 className='h3-style'>LEAVE APPLICATION</h3>
        {userData.map((user, index) => (
          <div key={user.id}>
            <div>
              <label >NAME :</label>
              <input readOnly value={user.name}></input>
            </div>
            <div>
              <label >DEPARTMENT & BATCH :</label>
              <input readOnly value={user.batch}></input>
            </div>
          </div>
        ))}
      <div>
        <label htmlFor="leaveType">LEAVE TYPE *</label>
        <select id="leaveType" value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
          <option value="">-- Select --</option>
          <option value="single">Single</option>
          <option value="multi">Multi</option>
        </select>
      </div>
      <div>
        <label htmlFor="leaveOn">FROM DATE *</label>
        <select id="leaveOn" value={fromDate} onChange={(e) => setFromDate(e.target.value)}>
              <option value="">-- Select --</option>
              {eventDates.map((date, index) => (
                <option key={index} value={date}>{date.toDateString()}</option>
              ))}
            </select>
      </div>
      <div>
        <label htmlFor="fromDate">TO DATE *</label>
        <select id="fromDate" value={leaveOn} onChange={(e) => setLeaveOn(e.target.value)}>
              <option value="">-- Select --</option>
              {eventDates.map((date, index) => (
                <option key={index} value={date}>{date.toDateString()}</option>
              ))}
            </select>
      </div>
      <div>
        <label htmlFor="session">SESSION</label>
        <select id="session" value={session} onChange={(e) => setSession(e.target.value)}>
          <option value="">-- Select --</option>
          <option value="Morning">Morning</option>
          <option value="Afternoon">Afternoon</option>
          <option value="Both">Both</option>
        </select>
      </div>
      <div>
        <label htmlFor="leaveReason">LEAVE REASON *</label>
        <select id="leaveReason" value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)}>
          <option value="">-- Select --</option>
          <option value="sick">Sick</option>
          <option value="bereavement">Bereavement</option>
          <option value="vacation">Vacation</option>
        </select>
      </div>
      <div>
        <label htmlFor="leaveDescription">LEAVE DESCRIPTION *</label>
        <textarea id="leaveDescription" name="message" rows="4" cols="50"value={leaveDescription} onChange={(e) => setLeaveDescription(e.target.value)}></textarea>
      </div>
      <div className='file-div'>
        <label htmlFor="attachment">ATTACHMENT</label>
        <input className='leave-file' type="file" id="attachment" accept=".jpg, .jpeg, .png" onChange={(e) => setAttachment(e.target.files[0])} />
      </div>
      <button type="submit" disabled={loading}>{loading ? "Submitting..." : "SUBMIT"}</button>
      </div>
      </form>
    </div>
    <UploadResume isOpen={model} closeModel={toggleModel} />
    <Logout isOpened={models} closeModels={toggleModels} />
    </div>
    </>
  );
};

export default ApplyLeave;
