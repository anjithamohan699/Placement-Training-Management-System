import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, Legend, Tooltip } from "recharts";
import "./StatisticsDisplay.css";
import { database } from "../Firebase";
import { useNavigate ,NavLink} from "react-router-dom";
import Logout from "./Logout";
import { IoLogOutOutline } from "react-icons/io5";
import { IoMdHome, IoMdPersonAdd } from "react-icons/io";

const BarChartComponent = ({ data }) => {
  return (
    <div className="recharts-wrapper">
      <BarChart width={600} height={300} data={data}>
        <XAxis dataKey="companyName" tick={{ fill: '#8884d8' }} dx={-10} />
        <YAxis dataKey="numPlaced" domain={[0, 200]} tick={{ fill: '#8884d8' }} dy={-4} />
        <Tooltip />
        <Legend />
        <Bar dataKey="numPlaced" fill="#00008B" />
      </BarChart>
    </div>
  );
};

function StatisticsDisplay() {
  const [data08, setData08] = useState([]);
  const [data09, setData09] = useState([]);

  useEffect(() => {
    const fetchData = async (collectionName) => {
      const querySnapshot = await getDocs(collection(database, collectionName));
      const fetchedData = querySnapshot.docs.map((doc) => doc.data());
      return fetchedData;
    };

    const fetchData08 = async () => {
      const data = await fetchData("companyDetails_batch8");
      setData08(data);
    };

    const fetchData09 = async () => {
      const data = await fetchData("companyDetails_batch9");
      setData09(data);
    };

    fetchData08();
    fetchData09();
  }, []);

  const sortedData08 = data08.sort((a, b) => b.numPlaced - a.numPlaced);
  const sortedData09 = data09.sort((a, b) => b.numPlaced - a.numPlaced);

  const handleViewDescription = (description) => {
    setSelectedDescription(description);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
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
  const navigate =useNavigate();

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

    <div className="stati-div">
      <h3>STATISTICS</h3>
      {sortedData08.length > 0 && (
        <div className="chart-container">
          <BarChartComponent data={sortedData08} />
          <p>Batch 8</p>
        </div>
      )}
      {sortedData09.length > 0 && (
        <div className="chart-container2">
          <BarChartComponent data={sortedData09} />
          <p>Batch 9</p>
        </div>
      )}
    </div>
    <Logout isOpened={models} closeModels={toggleModels} />
    </div>
    </>
  );
}

export default StatisticsDisplay;