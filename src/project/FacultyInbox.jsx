import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { FaBell, FaEye, FaTrash } from 'react-icons/fa';
import './FacultyInbox.css';
import { database } from '../Firebase';
import { useNavigate } from 'react-router-dom';
import { IoMdHome } from 'react-icons/io';
import { NavLink } from 'react-router-dom';
import { IoLogOutOutline } from 'react-icons/io5';
import Logout from './Logout';
import { useCookies } from 'react-cookie';

const FacultyInbox = () => {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStudentsDropdown, setShowStudentsDropdown] = useState(false);
  const [showDescription, setShowDescription] = useState(false); // State for description dropdown
  const navigate =useNavigate();
  const [csvData, setCsvData] = useState([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [showModals, setShowModals] = useState(false);
  const [cookie, setCookie] = useCookies(["email"]);
  const [userData, setUserData] = useState([]);
  const [profileImageUrl, setProfileImageUrl] = useState(null); // State to hold the profile image URL

  const formatDate = (timestamp) => {
    if (!timestamp) return '';

    if (timestamp.seconds && timestamp.nanoseconds) {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleDateString();
    }

    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      const notificationsCollection = collection(database, 'faculty_notification');
      const notificationsQuery = query(notificationsCollection);

      try {
        const notificationsSnapshot = await getDocs(notificationsQuery);
        const fetchedNotifications = [];

        for (const docRef of notificationsSnapshot.docs) {
          const notificationData = docRef.data();
          const studentsToNotify = notificationData.studentsToNotify || [];

          const studentDetails = [];

          // Fetch student names based on emails in studentsToNotify
          for (const studentEmail of studentsToNotify) {
            const studentQuery = query(collection(database, 'students'), where('email', '==', studentEmail));
            const studentQuerySnapshot = await getDocs(studentQuery);

            if (!studentQuerySnapshot.empty) {
              // Assuming each email matches only one student (unique email)
              const studentData = studentQuerySnapshot.docs[0].data();
              const studentName = studentData.name;

              studentDetails.push({
                email: studentEmail,
                name: studentName,
              });
            } else {
              console.warn('No student found for email:', studentEmail);
              // Handle case where student with the email is not found
            }
          }

          fetchedNotifications.push({
            id: docRef.id,
            timestamp: notificationData.timestamp,
            description: notificationData.description,
            attachmentUrl: notificationData.attachmentUrl,
            cgpaCondition: notificationData.selectedCgpaCondition,
            students: studentDetails,
          });
        }

        setNotifications(fetchedNotifications);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  const openModal = (notification) => {
    setSelectedNotification(notification);
  };

  const closeModal = () => {
    setSelectedNotification(null);
    setShowStudentsDropdown(false); // Reset dropdown state when closing modal
    setShowDescription(false); // Reset description dropdown state
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteDoc(doc(database, 'faculty_notification', notificationId));
      alert('Notification deleted successfully');
      setNotifications((prevNotifications) => prevNotifications.filter((notification) => notification.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
      alert('Failed to delete notification');
    }
  };

  const toggleStudentsDropdown = () => {
    setShowStudentsDropdown(!showStudentsDropdown); // Toggle students dropdown visibility state
  };

  const toggleDescriptionDropdown = () => {
    setShowDescription(!showDescription); // Toggle description dropdown visibility state
  };

  function redirectToFacultyNotification(){
    navigate('/facultynotificationdisplay')
  }

  function redirectToFacultyHome(){
    navigate('/faculty')
  }

  function handleProfile(){
    navigate('/facultyprofile')
  }

  function handleMarkAttendance(){
    navigate('/markattendance')
  }

  function handleResultDisplay(){
    navigate('/studresultdisplay')
  }

  function handleSendNotiFac(){
    navigate('/faculty-notification')
  }

  function handleReportGeneration(){
    navigate('/eventdescription')
  }

  function redirectToFacultyLogout(){
    toggleModels();
  }

  const [models, setModels] = useState(false);
  const toggleModels = () => {
    setModels(!models);
  };

const [notification, setNotification] = useState([]);
const [notificationCount, setNotificationCount] = useState(0); // Add state for notification count

useEffect(() => {
const unsubscribe = onSnapshot(collection(database, 'admin_notification'), (snapshot) => {
  const updatedNotifications = snapshot.docs.map(doc => doc.data());
  setNotification(updatedNotifications);

  // Update notification count based on unviewed notifications
  const unviewedNotifications = updatedNotifications.filter(notification => !notification.viewed);
  setNotificationCount(unviewedNotifications.length);
});

return () => unsubscribe();
}, []);

const handleFileUpload = (event) => {
const file = event.target.files[0];
const fileReader = new FileReader();

fileReader.onload = (e) => {
  const data = e.target.result;
  const parsedData = parseCSVData(data);
  console.log(parsedData);
  setCsvData(parsedData);
};

fileReader.readAsText(file);
};

const uploadToFirestore = async () => {
const resultsCollectionRef = collection(database, "results");

const snapshot = await getDocs(resultsCollectionRef);
const resultDocs = snapshot.docs;

csvData.forEach(async (student) => {
  const { rollNo, sgpa, cgpa } = student;

  const userDoc = resultDocs.find((doc) => doc.data().rollNo === rollNo);

  if (userDoc) {
    const userId = userDoc.id;
    const userDocRef = doc(database, "results", userId);

    const semesterFields = {
      [`${inputValue}_sgpa`]: sgpa,
      [`${inputValue}_cgpa`]: cgpa,
    };

    const updatedFields = {
      ...semesterFields,
      total__cgpa: cgpa,
    };

    await updateDoc(userDocRef, updatedFields)
      .then(() => {
        console.log("Student data updated in Firestore");
      })
      .catch((error) => {
        console.error(
          "Error updating student data in Firestore: ",
          error
        );
      });
  } else {
    console.log(`No user found with roll number ${rollNo}`);
  }
});
};

const parseCSVData = (csv) => {
const lines = csv.split("\n");

const nonEmptyLines = lines.filter((line) => line !== "");
const data = nonEmptyLines.map((line) => {
  const values = line.split(",");
  return {
    rollNo: values[0],
    sgpa: values[1],
    cgpa: values[2],
  };
});
return data;
};

useEffect(() => {
  const fetchDataFromFirestore = async () => {
    try {
      const querySnapshot = await getDocs(
        query(collection(database, "pt_coordinator"), where("email", "==", cookie.email))
      );
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setUserData(data);
      if (data.length > 0 && data[0].profilePictureUrl) {
        setProfileImageUrl(data[0].profilePictureUrl);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  if (cookie.email) {
    fetchDataFromFirestore();
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
            <NavLink className='nav-list' to='/faculty'
                  onClick= {redirectToFacultyHome} > <IoMdHome /> Home 
                </NavLink>
            </nav>
            <nav>
            <NavLink className='nav-list' to='/facultynotificationdisplay'
                  onClick= {redirectToFacultyNotification} > <div className="bell-icon-container">
                  <FaBell className="bell-icon" />
                  {notificationCount > 0 && (
            <span className="notification-count">{notificationCount}</span>
          )}
                </div>   Notification 
                </NavLink>
            </nav>
            <nav>
              <li className="nav-list" onClick={redirectToFacultyLogout}>
                <IoLogOutOutline /> Logout
              </li>
            </nav>
            </div> 
        </ul>
        </div>  
      
      <div className='outer-container'>
      <div className="sidebar">
      <div className="image-fac">
        {profileImageUrl ? (
              <img className='fac-img' src={profileImageUrl} alt='Profile' />
            ) : (
              <img className='fac-img' src='https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-portrait-176256935.jpg' alt='Default Profile' />
        )}
        </div>
        <div className="sidediv"><button className="sidebutton" onClick={handleProfile}> Profile Settings</button></div>
        <div className="sidediv"><button className="sidebutton" onClick={handleMarkAttendance} >Attendance</button></div>
        <div className="sidediv"><button className="sidebutton"onClick={handleSendNotiFac} >Send Notification</button></div>
        <div className="sidediv"><button className="sidebutton" onClick={handleReportGeneration} >Report</button></div>
        <div className="sidediv"><button className="sidebutton" onClick={() => setShowModals(true)}>Add Results</button>
        {showModals && (
        <div className="modal-result">
          <div className="modal-content-result">
            <span className="close-results" onClick={() => setShowModals(false)}>
              &times;
            </span>
            <label>Semester: </label>
            <input
              className="result-updation-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter semester"
            />
            <p>Format : s5</p>
            <label>File: </label>
            <input className="result-updation-input" type="file" onChange={handleFileUpload} />
            <p>The file must be a .csv containing only 3 fields (rollNo, sgpa, cgpa) in this order,<br/> without a header.</p>
            <button className="firestore-button" onClick={uploadToFirestore}>UPLOAD</button>
          </div>
        </div>
      )}</div>
        <div className="sidediv"><button className="sidebutton"onClick={handleResultDisplay}>Student Results</button></div>
    </div>

    <div className="fac-Inbox-notifications-display-container">
      <h1 className="fac-Inbox-noti-h1">NOTIFICATIONS</h1>
      <div className="fac-Inbox-notification-list">
        {notifications.map((notification) => (
          <div key={notification.id} className="fac-Inbox-notification-box">
            <div className='date-paragraph'><p>{formatDate(notification.timestamp)}</p></div>
            <div className="fac-Inbox-descp-inbox">
              <h3>{notification.description}</h3>
            </div>
            <button className="fac-Inbox-eye-icon" onClick={() => openModal(notification)}>
              <FaEye />
            </button>
            <button className="fac-Inbox-trash-icon" onClick={() => handleDeleteNotification(notification.id)}>
              <FaTrash />
            </button>
           
          </div>
        ))}
      </div>

      {/* Modal Overlay */}
      {selectedNotification && (
        <div className="fac-Inbox-modal-overlay">
          <div className="fac-Inbox-modal-content">
            <span className="fac-Inbox-close-icon" onClick={closeModal}>
              &times;
            </span>
            <h2>Description</h2>
            <p>CGPA Condition: Above {selectedNotification.cgpaCondition}</p>
            
            <button className="fac-Inbox-view-desc" onClick={toggleDescriptionDropdown}>
              {showDescription ? 'Hide Description' : 'View Description'}
            </button>
            {showDescription && (
              <p>{selectedNotification.description}</p>
            )}
              <button className='fac-Inbox-drop' onClick={toggleStudentsDropdown}>
                {showStudentsDropdown ? 'Hide Students' : 'View Students'}
              </button>
            {loading ? (
              <p>Loading student details...</p>
            ) : showStudentsDropdown && (
              <ul>
                {selectedNotification.students.map((student, index) => (
                  <li key={index}>
                    {student.name}
                  </li>
                ))}
              </ul>
            )}
            {selectedNotification.attachmentUrl && (
   
           <div className="fac-Inbox-attachment-box">
                <a href={selectedNotification.attachmentUrl} target="_blank" rel="noopener noreferrer">
                  View Attachment
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    <Logout isOpened={models} closeModels={toggleModels} />
    </div>
    </>
  );
};

export default FacultyInbox;
	