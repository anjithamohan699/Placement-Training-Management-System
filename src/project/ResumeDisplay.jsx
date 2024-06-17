import React, { useState, useEffect } from 'react';
import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import './ResumeDisplay.css'; // Import CSS file for styling
import { database } from '../Firebase';
import { NavLink, useNavigate } from 'react-router-dom';
import { IoLogOutOutline } from 'react-icons/io5';
import { FaBell } from 'react-icons/fa';
import { IoMdHome } from 'react-icons/io';
import { useCookies } from 'react-cookie';
import Logout from './Logout';

const ResumeDisplay = () => {
    const [students, setStudents] = useState([]);
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState('');

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

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const studentsCollection = collection(database, 'students');
                const snapshot = await getDocs(studentsCollection);

                // Map documents to student objects and sort by rollNo
                const studentData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })).sort((a, b) => a.rollNo - b.rollNo); // Sorting by rollNo

                setStudents(studentData);
            } catch (error) {
                console.error('Error fetching students: ', error);
            }
        };

        const fetchBatches = async () => {
            try {
                const studentsCollection = collection(database, 'students');
                const snapshot = await getDocs(studentsCollection);

                // Extract unique batches and sort them
                const uniqueBatches = Array.from(new Set(snapshot.docs.map(doc => doc.data().batch))).sort();
                setBatches(uniqueBatches);
            } catch (error) {
                console.error('Error fetching batches: ', error);
            }
        };

        fetchStudents();
        fetchBatches();
    }, []);

    const handleViewClick = (student) => {
        if (student.resume_url) {
            window.open(student.resume_url); // Open PDF in new tab
        } else {
            alert('Resume not uploaded by ' + student.name);
        }
    };

    const handleBatchChange = async (event) => {
        const selectedBatch = event.target.value;

        if (selectedBatch === 'select') {
            // If "Select Batch" is selected, clear the student list
            setSelectedBatch('');
            setStudents([]);
        } else {
            // Fetch students based on the selected batch
            setSelectedBatch(selectedBatch);
            try {
                const studentsCollection = collection(database, 'students');
                const batchQuery = query(studentsCollection, where('batch', '==', selectedBatch));
                const snapshot = await getDocs(batchQuery);

                // Map documents to student objects and sort by rollNo
                const studentData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })).sort((a, b) => a.rollNo - b.rollNo); // Sorting by rollNo

                setStudents(studentData);
            } catch (error) {
                console.error('Error fetching students: ', error);
                setStudents([]); // Clear students if an error occurs
            }
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
        <div className="sidediv"><button className="sidebutton" onClick={handleReportGeneration}>Report</button></div>
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
        <div className="resume-containers">
            <h1>RESUME</h1>
            <div className="resume-batch-select-containers">
                <label htmlFor="batchSelect">Select Batch:</label>
                <select
                    id="batchSelect"
                    value={selectedBatch}
                    onChange={handleBatchChange}
                    className="resume-selects" // Apply custom class for select element
                >
                    <option value="select">Select Batch</option>
                    {batches.map(batch => (
                        <option key={batch} value={batch}>{batch}</option>
                    ))}
                </select>
            </div>
            {selectedBatch && (
                <div className='resume-table-container'>
                <table className="resume-tables"> {/* Apply custom class for table element */}
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Register No</th>
                            <th>View Resume</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => (
                            <tr key={student.id}>
                                <td>{student.name}</td>
                                <td>{student.universityRegistrationNo}</td>
                                <td>
                                    <button onClick={() => handleViewClick(student)} className="resume-view-buttons">
                                        View
                                    </button>
                                </td>
   
                         </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            )}
        </div>
        <Logout isOpened={models} closeModels={toggleModels} />
        </div>
        </>
    );
};

export default ResumeDisplay;
	