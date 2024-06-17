import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, onSnapshot, query, where } from 'firebase/firestore';
import './MarkAttendance.css';
import { database } from './../Firebase';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import { IoMdHome } from 'react-icons/io';
import { IoLogOutOutline } from 'react-icons/io5';
import { useCookies } from 'react-cookie';
import Logout from './Logout';

function MarkAttendance() {
  
  const [students, setStudents] = useState([]);
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectAllPresent, setSelectAllPresent] = useState(true); // Initially set to true to mark all present
  const [eventOptions, setEventOptions] = useState([]);
  const [session, setSession] = useState("");
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [loading, setLoading] = useState(false); // State for loading status
  const navigate = useNavigate();
  const [cookie, setCookie] = useCookies(["email"]);
  const [userData, setUserData] = useState([]);
  const [profileImageUrl, setProfileImageUrl] = useState(null); // State to hold the profile image URL
  const [csvData, setCsvData] = useState([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [showModals, setShowModals] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const querySnapshot = await getDocs(collection(database, "students"));
        const studentData = querySnapshot.docs.map((doc) => doc.data());
        setStudents(studentData);
        const uniqueBatches = [
          ...new Set(studentData.map((student) => student.batch)),
        ];
        setBatches(uniqueBatches);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsCollectionRef = collection(database, "Events");
        const snapshot = await getDocs(eventsCollectionRef);
        const events = snapshot.docs.map((doc) => doc.data().eventName);
        setEventOptions(events);
      } catch (error) {
        console.error("Error fetching events: ", error);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchEventDate = async () => {
      try {
        if (eventName) {
          const eventsCollectionRef = collection(database, "Events");
          const q = query(
            eventsCollectionRef,
            where("eventName", "==", eventName)
          );
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            const docData = snapshot.docs[0].data();
            const dateWithoutTime = docData.eventDate.split("T")[0];
            setEventDate(dateWithoutTime);
          } else {
            setEventDate("");
          }
        }
      } catch (error) {
        console.error("Error fetching event date: ", error);
      }
    };

    fetchEventDate();
  }, [eventName]);

  const handleSelect = (student, status) => {
    const updatedStudents = selectedStudents.filter(
      (s) => s.slNo !== student.slNo
    );
    if (status === "present" || status === "absent") {
      setSelectedStudents([...updatedStudents, { ...student, status }]);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true); // Set loading to true during submission
  
      // Filter selected students based on their batch
      const selectedBatchStudents = students.filter(
        (student) => student.batch === selectedBatch
      );
  
      // Construct attendance object for each selected student
      const attendanceData = selectedBatchStudents.map((student) => ({
        name: student.name,
        email: student.email,
        rollNo: student.rollNo,
        status: selectedStudents.find((s) => s.slNo === student.slNo)?.status || "absent", // Set default status to "absent" if not selected
      }));
  
      // Add attendance document to the "Attendance" collection
      await addDoc(collection(database, "Attendance"), {
        eventName,
        eventDate,
        session,
        batch: selectedBatch,
        department: selectedDepartment,
        attendance: attendanceData,
      });
  
      console.log("Attendance submitted successfully");
      alert("Attendance submitted successfully");
  
      // Reset states after submission
      setEventName("");
      setEventDate("");
      setSelectedBatch("");
      setSelectedStudents([]);
      setSelectAllPresent(true);
      setSession("");
    } catch (error) {
      console.error("Error submitting attendance:", error);
    } finally {
      setLoading(false); // Set loading back to false after submission
    }
  };
  

  const handleCheckboxChange = (student, status) => {
    handleSelect(student, status);

    if (status === "present") {
      const absentCheckbox = document.getElementById(`absent-${student.slNo}`);
      if (absentCheckbox) {
        absentCheckbox.checked = false;
      }
    } else if (status === "absent") {
      const presentCheckbox = document.getElementById(
        `present-${student.slNo}`
      );
      if (presentCheckbox) {
        presentCheckbox.checked = false;
      }
    }
  };

  const handleMarkAll = () => {
    if (selectAllPresent) {
      setSelectedStudents(
        students.map((student) => ({ ...student, status: "absent" }))
      );
    } else {
      setSelectedStudents(
        students.map((student) => ({ ...student, status: "present" }))
      );
    }
    setSelectAllPresent(!selectAllPresent);
  };

  const handleClear = () => {
    setSelectedStudents([]);
    setSelectAllPresent(false);
  };

  useEffect(() => {
    if (selectedBatch) {
      const selectedStudents = students.filter(
        (student) => student.batch === selectedBatch
      );
      if (selectedStudents.length > 0) {
        const department = selectedStudents[0].department;
        setSelectedDepartment(department);
      }
    }
  }, [selectedBatch]);

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
        <div className="sidediv"><button className="Sidebutton" onClick={handleProfile}> Profile Settings</button></div>
        <div className="sidediv"><button className="Sidebutton" onClick={handleMarkAttendance} >Attendance</button></div>
        <div className="sidediv"><button className="Sidebutton"onClick={handleSendNotiFac} >Send Notification</button></div>
        <div className="sidediv"><button className="Sidebutton" onClick={handleReportGeneration} >Report</button></div>
        <div className="sidediv"><button className="Sidebutton" onClick={() => setShowModals(true)}>Add Results</button>
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
        <div className="sidediv"><button className="Sidebutton"onClick={handleResultDisplay}>Student Results</button></div>
    </div>

    <div className="attendance-container">
      <h1>ATTENDANCE</h1>
      <div className="input-group">
        <label className="input-group-event" htmlFor="eventName">
          Event Name:
        </label>
        <select
          id="eventName"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
        >
          <option value="">-- Select Event --</option>
          {eventOptions.map((event, index) => (
            <option key={index} value={event}>
              {event}
            </option>
          ))}
        </select>
        <label className="input-group-event" htmlFor="eventDate">
          Event Date:
        </label>
        <input type="text" id="eventDate" value={eventDate} readOnly />
      </div>
      <div className="input-group">
        <label htmlFor="session">Session:</label>
        <select
          id="session"
          value={session}
          onChange={(e) => setSession(e.target.value)}
        >
          <option value="">-- Select Session --</option>
          <option value="session1">Session 1</option>
          <option value="session2">Session 2</option>
          <option value="session3">Session 3</option>
          <option value="session4">Session 4</option>
        </select>
      </div>
      <div className="input-group">
        <label htmlFor="batch">Batch:</label>
        <select
          id="batch"
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
        >
          <option value="">-- Select Batch --</option>
          {batches.map((batch, index) => (
            <option key={index} value={batch}>
              {batch}
          </option>
          ))}
        </select> 
      </div>
      <table className='table-container-attendance'>
        <thead className='header-table-attendance'>
          <tr>
            <th>Roll No.</th>
            <th className='head-name'>Name</th>
            <th>Present</th>
            <th>Absent</th>
          </tr>
        </thead>
        <tbody>
          {students
            .filter((student) => student.batch === selectedBatch)
            .sort((a, b) => a.rollNo - b.rollNo)
            .map((student) => (
              <tr
                key={student.slNo}
                className={
                  selectedStudents.some(
                    (s) => s.slNo === student.slNo && s.status === "present"
                  )
                    ? "present"
                    : selectedStudents.some(
                        (s) => s.slNo === student.slNo && s.status === "absent"
                      )
                    ? "absent"
                    : ""
                }
              >
                <td>{student.rollNo}</td>
                <td>{student.name}</td>
                <td>
                  <input
                    className='check-status'
                    type="checkbox"
                    id={`present-${student.slNo}`}
                    checked={selectedStudents.some(
                      (s) => s.slNo === student.slNo && s.status === "present"
                    )}
                    onChange={() => handleCheckboxChange(student, "present")}
                  />
                </td>
                <td>
                  <input
                    className='check-status'
                    type="checkbox"
                    id={`absent-${student.slNo}`}
                    checked={selectedStudents.some(
                      (s) => s.slNo === student.slNo && s.status === "absent"
                    )}
                    onChange={() => handleCheckboxChange(student, "absent")}
                  />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      <div className="button-group">
        <button
          className={
            selectAllPresent
              ? "toggle-button-mark-absent"
              : "toggle-button-mark-present"
          }
          onClick={handleMarkAll}
        >
          {selectAllPresent ? "Mark all absent" : "Mark all present"}
        </button>
        <button className="clear-button-attendance" onClick={handleClear}>
          Clear
        </button>
        <button
          className="submit-button-attendance"
          onClick={handleSubmit}
          type="submit"
          disabled={loading} // Disable button when loading
        >
          {loading ? "Submitting..." : "SUBMIT"}
        </button>
      </div>
      </div>
      <Logout isOpened={models} closeModels={toggleModels} />
    </div>
    </>
  );
}

export default MarkAttendance;