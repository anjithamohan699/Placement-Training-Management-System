import React, { useState, useEffect } from 'react';
import './StudentDetailsDisplayAdmin.css';
import { collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { database } from '../Firebase';
import Logout from './Logout';
import { NavLink, useNavigate } from 'react-router-dom';
import { IoMdHome, IoMdPersonAdd } from 'react-icons/io';
import { IoLogOutOutline } from 'react-icons/io5';

const StudentDetailsDisplayAdmin = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [batchOptions, setBatchOptions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      const querySnapshot = await getDocs(collection(database, "students"));
      const studentsData = [];
      querySnapshot.forEach((doc) => {
        studentsData.push({ ...doc.data(), id: doc.id });
      });
      // Sort students by rollNo after fetching
      studentsData.sort((a, b) => a.rollNo - b.rollNo);
      setStudents(studentsData);

      // Extract unique batch options
      const uniqueBatches = [...new Set(studentsData.map((student) => student.batch))];
      setBatchOptions(uniqueBatches);
    };

    fetchStudents();
  }, []);

  const handleDelete = async (id) => {
    await deleteDoc(doc(database, "students", id));
    setStudents(students.filter((student) => student.id !== id));
  };

  const handleViewProfile = (student) => {
    setSelectedStudent(student);
  };

  const handleBatchSelect = (e) => {
    setSelectedBatch(e.target.value);
  };

  const formatBatch = (batch) => {
    const parts = batch.split('-');
    let batchNumber, department, year;

    if (parts.length >= 4) {
      [, batchNumber, department, , year] = parts;
    } else if (parts.length === 3) {
      [, batchNumber, department, year] = parts;
    }

    return batchNumber && department && year
      ? `BATCH ${batchNumber} - ${year} ${department}`
      : batch;
  };

  function redirectToSignUp() {
    navigate("/signup");
  }

  function redirectToAdminHome() {
    navigate("/admin");
  }

  function redirectToAdminLogout() {
    toggleModels();
  }

  function handleAddNoti() {
    navigate("/admin-notification");
   }
 
   function handleLeaveApproval() {
     navigate("/leaveapproval")
   }

   function handleViewStudents(){
    navigate("/studentdetails")
  }

  function handleDisplayStatistics(){
    navigate('/displaystatistics')
  }

  function handleInbox(){
    navigate('/inbox')
  }

  const [showPopup, setShowPopup] = useState(false);
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventAttachment, setEventAttachment] = useState(null); // Store file object
  const [uploading, setUploading] = useState(false); // State to track uploading status

  const handleAddEvent = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleEventNameChange = (e) => {
    setEventName(e.target.value);
  };

  const handleEventDateChange = (e) => {
    setEventDate(e.target.value);
  };

  function redirectToAdminLogout(){
    toggleModels();
  }

  const handleEventAttachmentChange = (e) => {
    // Get the selected file
    const file = e.target.files[0];
    setEventAttachment(file);
  };

  const handleSubmit = async () => {
    // Close the popup
    setShowPopup(false);

    // Set uploading status to true
    setUploading(true);

    // Upload file to Firebase Storage
    let attachmentUrl = "";
    if (eventAttachment) {
      const attachmentRef = ref(storage, `event_attachments/${eventAttachment.name}`);
      const uploadTask = uploadBytesResumable(attachmentRef, eventAttachment);

      uploadTask.on('state_changed',
        () => {},
        (error) => {
          console.error("Error uploading attachment: ", error);
          // Set uploading status to false in case of error
          setUploading(false);
        },
        () => {
          // Upload completed successfully, get download URL
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            console.log('File available at', downloadURL);
            attachmentUrl = downloadURL;

            // Create a new document in the "events" collection
            addEventToFirestore(attachmentUrl);
          });
        }
      );
    } else {
      // If no attachment, directly add event to Firestore
      addEventToFirestore("");
    }
  };

  const addEventToFirestore = async (attachmentUrl) => {
    try {
      const docRef = await addDoc(collection(database, "Events"), {
        eventName: eventName,
        eventDate: eventDate,
        eventAttachment: attachmentUrl
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (error) {
      console.error("Error adding document: ", error);
    }

    // Clear input fields and reset uploading status
    setEventName("");
    setEventDate("");
    setEventAttachment(null);
    setUploading(false);
  };

   const [models, setModels] = useState(false);
  const toggleModels = () => {
    setModels(!models);
  };

  return (
    <>
      <div className="navbar1">
    <div className="first-portion1">
      <div className="logo1">
        <label>ALBERTIAN INSTITUTE OF SCIENCE AND TECHNOLOGY (AISAT)</label>
      </div>
    </div>

    <ul>
      <div className="last-portion1">
        <nav>
        <NavLink className='nav-lists' to='/admin'
              onClick= {redirectToAdminHome} > <IoMdHome /> Home 
            </NavLink>
        </nav>
        <nav>
        <NavLink className='nav-lists' to='/signup'
              onClick= {redirectToSignUp} > <IoMdPersonAdd /> Create Account 
            </NavLink>
        </nav>
        <nav>
              <li className="nav-lists" onClick={redirectToAdminLogout}>
                <IoLogOutOutline /> Logout
              </li>
        </nav>
      </div>
    </ul>
  </div>
  <div className="outer-div">
        <div className="sidebar">
          <div className="image-admin">
            <img  
              className="admin-img"
              src="https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-portrait-176256935.jpg"
            ></img>
          </div>
          <div className="sidediv">
            <button className="Sidebutton" onClick={handleAddNoti}>Send Notification</button>
          </div>
          <div className="sidediv">
            <button className="Sidebutton" onClick={handleAddEvent}>
              Add Event
            </button>
            {showPopup && (
        <div className="modal-calendar">
          <div className="modal-content-calendar">
            <span className="close-calendar" onClick={handleClosePopup}>&times;</span>
            <h2>ADD EVENT</h2> 
            <label>Event Name:</label>
            <input
            className='eventname-input'
              type="text"
              value={eventName}
              onChange={handleEventNameChange}
            />
            <label>Event Date:</label>
            <input
            className='eventname-input'
              type="date"
              value={eventDate}
              onChange={handleEventDateChange}
            />
            <label>Attachment:</label>
            <input className='eventname-input'
              type="file"
              onChange={handleEventAttachmentChange}
            />
            {uploading && <p>Uploading...</p>}
            <div className="button-container-calendar">
              <button onClick={handleSubmit}>Submit</button>
              <button onClick={handleClosePopup}>Cancel</button>
            </div>
          </div>
        </div>
      )}
          </div>
          <div className="sidediv">
            <button className="Sidebutton" onClick={handleLeaveApproval}>Leave Approval</button>
          </div>
          <div className="sidediv">
            <button className="Sidebutton" onClick={handleDisplayStatistics}>Statistics</button>
          </div>
          <div className="sidediv">
            <button className="sidebutton" onClick={handleInbox}>Inbox</button>
          </div>
          <div className="sidediv">
            <button className="Sidebutton" onClick={handleViewStudents}>View Students</button>
          </div>
        </div>

    <div className="stud-div-container">
      <h3>STUDENT PROFILE</h3>
      <select onChange={handleBatchSelect}>
        <option value="">Select Batch</option>
        {batchOptions.map((batch) => (
          <option key={batch} value={batch}>
            {formatBatch(batch)}
          </option>
        ))}
      </select>
      <div className='student-details-container'>
      <table className="student-details-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Register No</th>
            <th>Action</th>
            <th>Profile</th>
          </tr>
        </thead>
        <tbody>
          {students
            .filter((student) => student.batch === selectedBatch)
            .map((student) => (
              <tr key={student.id}>
                <td>{student.name}</td>
                <td>{student.universityRegistrationNo}</td>
                <td>
                  <button onClick={() => handleDelete(student.id)}>Delete</button>
                  <button onClick={() => handleViewProfile(student)}>View Profile</button>
                </td>
                <td>
                  {selectedStudent && selectedStudent.id === student.id && (
                    <div>
                      <p>Name: {selectedStudent.name}</p>
                      <p>Roll No: {selectedStudent.rollNo}</p>
                      <p>Application No: {selectedStudent.applicationNo}</p>
                      <p>Admission No: {selectedStudent.admissionNo}</p>
                      <p>University Registration No: {selectedStudent.universityRegistrationNo}</p>
                      <p>Student ID: {selectedStudent.studentId}</p>
                      <p>Department: {selectedStudent.department}</p>
                      <p>Batch: {selectedStudent.batch}</p>
                      <p>Email: {selectedStudent.email}</p>
                      <p>Nationality: {selectedStudent.nationality}</p>
                      <p>Gender: {selectedStudent.gender}</p>
                      <p>Date of Birth: {selectedStudent.dob}</p>
                      <p>Birth Place: {selectedStudent.birth_place}</p>
                      <p>State: {selectedStudent.state}</p>
                      <p>Aadhaar No: {selectedStudent.adhaarNo}</p>
                    </div>
                  )}
                </td>
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

export default StudentDetailsDisplayAdmin;
