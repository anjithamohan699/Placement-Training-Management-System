import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, where, onSnapshot } from 'firebase/firestore';
import './ResultDisplayFac.css';
import { database } from '../Firebase';
import { IoLogOutOutline } from 'react-icons/io5';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import { IoMdHome } from 'react-icons/io';
import Logout from './Logout';
import { useCookies } from 'react-cookie';

const BATCH_SIZE = 10; // Adjust batch size based on performance and query limits

const ResultDisplayFac = () => {

  const navigate =useNavigate();
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

  const [results, setResults] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');

  useEffect(() => {
    const fetchBatchOptions = async () => {
      try {
        const batchCollectionRef = collection(database, 'students');
        const batchSnapshot = await getDocs(batchCollectionRef);
        const uniqueBatches = new Set(batchSnapshot.docs.map(doc => doc.data().batch));
        setBatchOptions(Array.from(uniqueBatches));
      } catch (error) {
        console.error('Error fetching batch options:', error);
      }
    };

    fetchBatchOptions();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedBatch) {
        setResults([]);
        return;
      }

      try {
        const studentsCollectionRef = collection(database, 'students');
        const studentsQuery = query(studentsCollectionRef, where('batch', '==', selectedBatch));
        const studentsSnapshot = await getDocs(studentsQuery);

        const studentEmails = studentsSnapshot.docs.map(doc => doc.data().email);

        // Split emails into batches to stay within the IN query limit
        const batches = [];
        for (let i = 0; i < studentEmails.length; i += BATCH_SIZE) {
          const batch = studentEmails.slice(i, i + BATCH_SIZE);
          batches.push(batch);
        }

        const resultsCollectionRef = collection(database, 'results');
        const mergedData = [];

        // Fetch results for each batch of emails
        for (const batch of batches) {
          const resultsQuery = query(resultsCollectionRef, where('email', 'in', batch));
          const resultsSnapshot = await getDocs(resultsQuery);

          resultsSnapshot.forEach(doc => {
            const { email, total__cgpa } = doc.data();
            mergedData.push({ email, total__cgpa });
          });
        }

        // Merge student data with results based on email
        const studentDataWithCGPA = studentsSnapshot.docs.map(doc => {
          const student = doc.data();
          const matchedResult = mergedData.find(result => result.email === student.email);
          return { ...student, total__cgpa: matchedResult ? matchedResult.total__cgpa : 0 };
        });

        const sortedData = studentDataWithCGPA.sort((a, b) => a.rollNo - b.rollNo);
        setResults(sortedData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setResults([]);
      }
    };

    fetchData();
  }, [selectedBatch]);

  const handleBatchChange = event => {
    setSelectedBatch(event.target.value);
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

    <div className="scroll-container-stud">
      <h1>STUDENT RESULTS</h1>
      <div>
        <select className="stud-selection" id="batchSelect" value={selectedBatch} onChange={handleBatchChange}>
          <option value="">Select a Batch</option>
          {batchOptions.map((batch, index) => (
            <option key={index} value={batch}>
              {batch}
            </option>
          ))}
        </select>
      </div>
      <div className="scroll-table-stud">
        <table className='result-display-table'>
          <thead className='header-table-result'>
            <tr>
              <th>Student Name</th>
              <th>Register No</th>
              <th>Email</th>
              <th>Total CGPA</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={index}>
                <td>{result.name}</td>
                <td>{result.universityRegistrationNo}</td>
                <td>{result.email}</td>
                <td>{result.total__cgpa}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    <Logout isOpened={models} closeModels={toggleModels} /> 
    </div>
    </>
  );
};

export default ResultDisplayFac;

