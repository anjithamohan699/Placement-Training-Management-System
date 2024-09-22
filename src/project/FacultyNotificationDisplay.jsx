import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, where, query, getDocs ,arrayUnion} from 'firebase/firestore';
import './FacultyNotificationDisplay.css';
import { FaBell, FaEye, FaFile } from 'react-icons/fa'; // Added FaFile for attachment icon
import { database } from '../Firebase';
import { IoLogOutOutline } from 'react-icons/io5';
import { IoMdHome } from 'react-icons/io';
import { useNavigate, NavLink } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import Logout from './Logout';

const FacultyNotificationDisplay = () => {

  const [notifications, setNotifications] = useState([]);
  const [selectedNotifications, setSelectedNotifications] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showModals, setShowModals] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [cookie, setCookie] = useCookies(["email"]);
  const [userData, setUserData] = useState([]);
  const [profileImageUrl, setProfileImageUrl] = useState(null); 
  const [csvData, setCsvData] = useState([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [showModal, setShowModal] = useState(false);

  // useEffect(() => {
  //   const unsubscribe = onSnapshot(collection(database, 'admin_notification'), (snapshot) => {
  //     const updatedNotifications = snapshot.docs.map(doc => ({
  //       id: doc.id,
  //       date: doc.data().date,
  //       description: doc.data().description,
  //       viewed: doc.data().viewed,
  //       attachmentUrl: doc.data().attachmentUrl // Include attachmentUrl in the object
  //     }));
  //     updatedNotifications.sort((a, b) => (a.viewed === b.viewed ? 0 : a.viewed? 1: -1));
  //     setNotifications(updatedNotifications);
  //   });

  //   return () => unsubscribe();
  // }, []);

  // const handleViewNotificationDetails = (notification) => {
  //   setSelectedNotifications(notification);
  //   setShowModals(true);

  //   const notificationRef = doc(database, 'admin_notification', notification.id);
  //   updateDoc(notificationRef, {
  //     viewed: true
  //   })
  //   .then(() => {
  //     console.log("Notification viewed status updated successfully");
  //   })
  //   .catch((error) => {
  //     console.error("Error updating notification viewed status: ", error);
  //   });

  //   const updatedNotifications = notifications.map((item) =>
  //     item.id === notification.id ? { ...item, viewed: true } : item
  //   );
  //   setNotifications(updatedNotifications);
  // };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(database, 'admin_notification'), (snapshot) => {
      const userEmail = cookie.email;
      const updatedNotifications = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          viewed: data.viewedBy?.includes(userEmail) || false,
        };
      });
  
      updatedNotifications.sort((a, b) => (a.viewed === b.viewed ? 0 : a.viewed ? 1 : -1));
      setNotifications(updatedNotifications);
    });
  
    return () => unsubscribe();
  }, [cookie.email]);
  
  const handleViewNotificationDetails = async (notification) => {
    setSelectedNotification(notification);
    setShowModals(true);
  
    if (!notification.viewed) {
      const notificationRef = doc(database, 'admin_notification', notification.id);
      await updateDoc(notificationRef, {
        viewedBy: arrayUnion(cookie.email)
      });
  
      const updatedNotifications = notifications.map((item) =>
        item.id === notification.id ? { ...item, viewed: true } : item
      );
      setNotifications(updatedNotifications);
    }
  };  

  const handleCloseModal = () => {
    setShowModals(false);
    setSelectedNotifications(null);
  };

  const handleViewMore = () => {
    setShowAllNotifications(true);
  };

  const navigate = useNavigate();
    
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
  const [notificationCount, setNotificationCount] = useState(0);

  // useEffect(() => {
  //   const unsubscribe = onSnapshot(collection(database, 'admin_notification'), (snapshot) => {
  //     const updatedNotifications = snapshot.docs.map(doc => doc.data());
  //     setNotification(updatedNotifications);

  //     const unviewedNotifications = updatedNotifications.filter(notification => !notification.viewed);
  //     setNotificationCount(unviewedNotifications.length);
  //   });

  //   return () => unsubscribe();
  // }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(database, 'admin_notification'), (snapshot) => {
      const userEmail = cookie.email;
      const updatedNotifications = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          viewed: data.viewedBy?.includes(userEmail) || false,
        };
      });
  
      updatedNotifications.sort((a, b) => (a.viewed === b.viewed ? 0 : a.viewed ? 1 : -1));
      setNotifications(updatedNotifications);
  
      const unviewedNotifications = updatedNotifications.filter(notification => !notification.viewed);
      setNotificationCount(unviewedNotifications.length);
    });
  
    return () => unsubscribe();
  }, [cookie.email]);

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
              <NavLink className='nav-list' to='/faculty' onClick={redirectToFacultyHome}>
                <IoMdHome /> Home 
              </NavLink>
            </nav>
            <nav>
              <NavLink className='nav-list' to='/facultynotificationdisplay' onClick={redirectToFacultyNotification}>
                <div className="bell-icon-container">
                  <FaBell className="bell-icon" />
                  {notificationCount > 0 && (
                    <span className="notification-count">{notificationCount}</span>
                  )}
                </div> Notification 
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
          <div className="sidediv">
            <button className="Sidebutton" onClick={handleProfile}> Profile Settings</button>
          </div>
          <div className="sidediv"><button className="Sidebutton" onClick={handleMarkAttendance} >Attendance</button></div>
        <div className="sidediv"><button className="Sidebutton"onClick={handleSendNotiFac} >Send Notification</button></div>
        <div className="sidediv"><button className="Sidebutton" onClick={handleReportGeneration} >Report</button></div>
        <div className="sidediv"><button className="Sidebutton" onClick={() => setShowModal(true)}>Add Results</button>
        {showModal && (
        <div className="modal-result">
          <div className="modal-content-result">
            <span className="close-results" onClick={() => setShowModal(false)}>
              &times;
            </span>
            <label>Semester: </label>
            <input className="result-updation-input"
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
        <div className="sidediv"><button className="Sidebutton"onClick={handleResultDisplay}>Student Results</button></div>
        </div>
        <div className="faculty-container">
          <h2>NOTIFICATIONS FROM ADMIN</h2>
          <div className="notification-list-container">
            {notifications.length === 0 ? (
              <p>No notifications available</p>
            ) : (
              <div className="notification-list">
                {showAllNotifications ? (
                  notifications.map(notification => (
                    <div key={notification.id} className={`notification-item ${notification.viewed ? 'viewed' : 'new'}`}>
                      <div className='dates'>{notification.date}</div>
                      <div className='faculty-inbox'><h3>{notification.description}</h3></div>
                      <button className="view-details-buttons" onClick={() => handleViewNotificationDetails(notification)}>
                        <FaEye />
                      </button>
                      {/* Display attachment icon if attachmentUrl exists */}
                      {notification.attachmentUrl && (
                        <a href={notification.attachmentUrl} target="_blank" rel="noopener noreferrer" className="attachment-link">
                          <FaFile />
                        </a>
                      )}
                    </div>
                  ))
                ) : (
                  notifications.slice(0, 5).map(notification => (
                    <div key={notification.id} className={`notification-item ${notification.viewed ? 'viewed' : 'new'}`}>
                      <div className='dates'>{notification.date}</div>
                      <div className='faculty-inbox'><h3>{notification.description}</h3></div>
                      <button className="view-details-buttons" onClick={() => handleViewNotificationDetails(notification)}>
                        <FaEye />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          
          {!showAllNotifications && notifications.length > 5 && (
            <button className="view-more-button" onClick={handleViewMore}>
              View More
            </button>
          )}

          {showModals && selectedNotifications && (
            <div className="display-overlay">
              <div className="modal-display">
                <span className="close-button-display" onClick={handleCloseModal}>×</span>
                <h2>Notification Details</h2>
                <p>{selectedNotifications.description}</p>
                {selectedNotifications.attachmentUrl && (
                  <a href={selectedNotifications.attachmentUrl} target="_blank" rel="noopener noreferrer" className="attachment-link">
                    View Attachment
                  </a>
                )}
                {/* Add other details here as needed */}
              </div>
            </div>
          )}
        </div>
        <Logout isOpened={models} closeModels={toggleModels} />
      </div>
    </>
  );
};

export default FacultyNotificationDisplay;
