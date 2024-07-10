import "./FacultyInterface.css";
import { IoMdHome , IoIosNotifications } from "react-icons/io";
import { IoLogOutOutline } from "react-icons/io5";
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import { NavLink } from 'react-router-dom';
import { database } from "../Firebase";
import { collection, onSnapshot ,updateDoc ,getDocs, doc, query, where} from "firebase/firestore";
import { FaBell } from "react-icons/fa";
import EventCalendar from "./EventCalendar";
import Logout from "./Logout";
import { useCookies } from "react-cookie";

function FacultyInterface() {

  //const [activeTab,setActiveTab] = useState("Home");
  const navigate =useNavigate();
  const [csvData, setCsvData] = useState([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [showModals, setShowModals] = useState(false);
  const [cookie, setCookie] = useCookies(["email"]);
  const [userData, setUserData] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
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

  // useEffect(() => {
  //   const unsubscribe = onSnapshot(collection(database, 'admin_notification'), (snapshot) => {
  //     const updatedNotifications = snapshot.docs.map(doc => doc.data());
  //     setNotifications(updatedNotifications);

  //     // Update notification count based on unviewed notifications
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
      setNotificationCount(notificationCount - 1);
    }
  };  

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
    <div className='top-div'>
      <li className='lists'>
      <Link to='/facultyinbox'>Inbox</Link>
      </li>
      <li className='lists'>
      <Link to='/markattendance'>Attendance</Link>
      </li>
      <li className='lists'>
      <Link to='/displayresume'>Resume</Link>
      </li>
    </div>
    <EventCalendar />
    <Logout isOpened={models} closeModels={toggleModels} /> 
    </div>
    </>
  )
}

export default FacultyInterface;

