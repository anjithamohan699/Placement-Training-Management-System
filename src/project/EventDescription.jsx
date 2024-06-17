import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where,addDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { database , auth ,storage } from '../Firebase';
import './EventDescription.css';
import Logout from './Logout';
import { IoLogOutOutline } from 'react-icons/io5';
import { NavLink } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import { IoMdHome } from 'react-icons/io';
import { useCookies } from 'react-cookie';

const EventDescription = () => {

  const [csvData, setCsvData] = useState([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [showModals, setShowModals] = useState(false);
  const [cookie, setCookie] = useCookies(["email"]);
  const [userData, setUserData] = useState([]);
  const [profileImageUrl, setProfileImageUrl] = useState(null); // State to hold the profile image URL
    
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

  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0); // Add state for notification count

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(database, 'admin_notification'), (snapshot) => {
      const updatedNotifications = snapshot.docs.map(doc => doc.data());
      setNotifications(updatedNotifications);

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

  const [loading, setLoading] = useState(false);
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [photos, setPhotos] = useState([]);
  const [eventOptions, setEventOptions] = useState([]);
  const [reportFrom, setReportFrom] = useState('');
  const [academicDept, setAcademicDept] = useState('');
  const [reportTo, setReportTo] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  function handleReport(){
    navigate('/reportgeneration');
  }

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        const userEmail = user ? user.email : '';

        if (userEmail) {
          const userDataRef = collection(database, 'pt_coordinator');
          const q = query(userDataRef, where('email', '==', userEmail));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            setAcademicDept(userData.academic_dept);
            setName(userData.name);
            setReportFrom(`${userData.name} 
${userData.academic_dept}`);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsCollectionRef = collection(database, 'Events');
        const snapshot = await getDocs(eventsCollectionRef);
        const events = snapshot.docs.map(doc => doc.data().eventName);
        setEventOptions(events);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);


  // Fetch event date based on selected event name
  useEffect(() => {
    const fetchEventDate = async () => {
      try {
        if (eventName) {
          const eventsCollectionRef = collection(database, 'Events');
          const q = query(eventsCollectionRef, where('eventName', '==', eventName));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            const docData = snapshot.docs[0].data();
            const dateWithoutTime = docData.eventDate.split('T')[0];
            setEventDate(dateWithoutTime);
          } else {
            setEventDate('');
          }
        }
      } catch (error) {
        console.error('Error fetching event date: ', error);
      }
    };

    fetchEventDate();
  }, [eventName]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!eventName || !eventDate || !eventDescription || !reportTo || photos.length === 0) {
      alert('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const uploadTasks = photos.map(photo => {
        const fileName = `${Date.now()}_${photo.name}`;
        const fileRef = ref(storage, `event_photos/${fileName}`);
        return { fileRef, photo };
      });

      const uploadPromises = uploadTasks.map(({ fileRef, photo }) => uploadBytes(fileRef, photo));
      await Promise.all(uploadPromises);

      const photoUrls = [];
      for (const { fileRef } of uploadTasks) {
        const downloadUrl = await getDownloadURL(fileRef);
        photoUrls.push(downloadUrl);
      }

      const eventUrl = photoUrls.length > 0 ? photoUrls[0] : '';

      await addDoc(collection(database, 'eventDescriptions'), {
        eventName,
        eventDate,
        eventDescription,
        reportFrom,
        academicDept,
        reportTo,
        eventUrl
      });

      alert('Event description added successfully!');

      setEventName('');
      setEventDate('');
      setEventDescription('');
      setReportTo('');
      setPhotos([]);
    } catch (error) {
      console.error('Error adding event description:', error);
      alert('Failed to add event description. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(files);
  };

  const handleMultilineInput = (e, setter) => {
    const { keyCode } = e;
    if (keyCode === 13) {
      e.preventDefault();
      setter(prevState => prevState + '\n');
    }
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
        <div className="sidediv"><button className="sidebutton"onClick={handleResultDisplay}>Student Results</button></div>
    </div>

    <div className="add-event-description-container">
      <h1>EVENT DESCRIPTION</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group-description">
          <label htmlFor="eventName">Event Name:</label>
          <select id="eventName" value={eventName} onChange={(e) => setEventName(e.target.value)}>
            <option value="">-- Select Event --</option>
            {eventOptions.map((event, index) => (
              <option key={index} value={event}>{event}</option>
            ))}
          </select>
        </div>
        <div className="form-group-description">
          <label htmlFor="eventDate">Event Date:</label>
          <input type="text" id="eventDate" value={eventDate} readOnly />
        </div>
        <div className="form-group-description">
          <label htmlFor="eventDescription">Event Description:</label>
          <textarea
            id="eventDescription"
            value={eventDescription}
            onChange={(e) => setEventDescription(e.target.value)}
          />
        </div>
        <div className="form-group-description">
          <label htmlFor="reportFrom">From:</label>
          <textarea
            id="reportFrom"
            value={reportFrom}
            readOnly
          />
        </div>
        <div className="form-group-description">
          <label htmlFor="academicDept">Academic Department:</label>
          <input
            type="text"
            id="academicDept"
            value={academicDept}
            readOnly
          />
        </div>
        <div className="form-group-description">
          <label htmlFor="reportTo">To:</label>
          <textarea
            id="reportTo"
            value={reportTo}
            onChange={(e) => setReportTo(e.target.value)}
            onKeyDown={(e) => handleMultilineInput(e, setReportTo)}
          />
        </div>
        <div className="form-group-description">
          <label htmlFor="photos">Upload Photos:</label>
          <input type="file" id="photos" accept=".jpg, .jpeg, .png" multiple onChange={handlePhotoChange} />
        </div>
        <div className='report-button-container'>
        <button className='add-event-button' type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
        <button className='report-generation-button' onClick={handleReport}>Generate Report</button>
        </div>
      </form>
    </div>
    <Logout isOpened={models} closeModels={toggleModels} />
    </div>
    </>
  );
};

export default EventDescription;

