import React, { useEffect, useState } from "react";
import "./StudentProfile.css";
import { NavLink, useNavigate } from "react-router-dom";
import { IoIosNotifications, IoMdHome } from "react-icons/io";
import { IoLogOutOutline } from "react-icons/io5";
import { useCookies } from "react-cookie";
import { collection, getDocs, query, where, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { database, storage } from "../Firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import UploadResume from "./UploadResume";
import { FaBell } from "react-icons/fa";
import Logout from "./Logout";

const StudentProfile = (props) => {

  const [activeTab, setActiveTab] = useState("Home");
  const navigate = useNavigate();
  const [cookie, setCookie] = useCookies(["email"]);
  const [userData, setUserData] = useState([]);
  const [imageUpload, setImageUpload] = useState(null); // State to hold the uploaded image
  const [profileImageUrl, setProfileImageUrl] = useState(null); // State to hold the profile image URL
  const [model, setModel] = useState(false);

  useEffect(() => {
    const fetchDataFromFirestore = async () => {
      try {
        const querySnapshot = await getDocs(
          query(collection(database, "students"), where("email", "==", cookie.email))
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

  const handleInputChange = (index, fieldName, e) => {
    const newUserData = [...userData];
    newUserData[index][fieldName] = e.target.value;
    setUserData(newUserData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userRef = doc(database, "students", userData[0].id);
      await updateDoc(userRef, {
        name: userData[0].name,
        dob: userData[0].dob,
        gender: userData[0].gender,
        religion: userData[0].religion,
        caste: userData[0].caste,
        studentPhone: userData[0].studentPhone,
        permanentAddress: userData[0].permanentAddress,
      });

      if (imageUpload) {
        const storageRef = ref(storage, `profile_photo/${userData[0].id}/${imageUpload.name}`);
        await uploadBytes(storageRef, imageUpload);
        const imageUrl = await getDownloadURL(storageRef);
        await updateDoc(doc(database, "students", userData[0].id), {
          profilePictureUrl: imageUrl
        });
        setProfileImageUrl(imageUrl);
        console.log("Image uploaded successfully!");
      }

      console.log("Data updated successfully!");
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const handleProfile = () => {
    navigate("/studentprofile");
  };

  const toggleModel = () => {
    setModel(!model);
  };

  const handleImageUpload = async (event) => {
    const imageFile = event.target.files[0];
    try {
      const storageRef = ref(storage, `profile_photo/${userData[0].id}/${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      const imageUrl = await getDownloadURL(storageRef);
      await updateDoc(doc(database, "students", userData[0].id), {
        profilePictureUrl: imageUrl
      });
      setProfileImageUrl(imageUrl);
      console.log("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const redirectToStudentHome = () => {
    navigate('/student');
  };

  function handleApplyLeave(){
    navigate('/applyleave');
  }

  const redirectToStudentNotification = () => {
    navigate('/studentnotificationdisplay');
  };

  function handleLeaveInbox(){
    navigate('/leaveinbox');
  }

  function handleResult(){
    navigate('/result');
  }

  function handleAttendance(){
    navigate('/displayattendance');
  }

  function redirectToStudentLogout(){
    toggleModels();
  }

  const [models, setModels] = useState(false);
  const toggleModels = () => {
    setModels(!models);
  };

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
          <div className="last-portions">
            <nav>
              <NavLink className="nav-list" to="/student" onClick={redirectToStudentHome}>
                <IoMdHome /> Home
              </NavLink>
            </nav>
            <nav>
            <NavLink className='nav-list' to='/studentnotificationdisplay' 
              onClick= {redirectToStudentNotification} > 
              <div className="bell-icon-containers">
                  <FaBell className="bell-icons" />
                  {notificationCount > 0 && (
              <span className="notification-counts">{notificationCount}</span>
              )}
                </div> Notification
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

      <div className="outer-container">
        <div className="sidebar">
          <div className="image-stud">
          {profileImageUrl ? (
              <img className='stud-img' src={profileImageUrl} alt='Profile' />
            ) : (
              <img className='stud-img' src='https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-portrait-176256935.jpg' alt='Default Profile' />
            )}
          </div>
          <div className="sidediv">
            <button className="Sidebutton" onClick={handleProfile}>
              Profile Settings
            </button>
          </div>
          <div className="sidediv">
            <button className="Sidebutton" onClick={toggleModel}>
              Resume
            </button>
          </div>
          <div className="sidediv">
            <button className="Sidebutton" onClick={handleLeaveInbox}>Applied Leave(s)</button>
          </div>
          <div className="sidediv">
            <button className="Sidebutton" onClick={handleAttendance}>Attendance</button>
          </div>
          <div className="sidediv">
            <button className="Sidebutton" onClick={handleResult}>University Results</button>
          </div>
          <div className="sidediv">
            <button className="Sidebutton" onClick={redirectToStudentNotification}>Notification</button>
          </div>
          <div className="sidediv">
            <button className="Sidebutton" onClick={handleApplyLeave}>Apply For Leave</button>
          </div>
        </div>
        <div className="profile-div">
          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="myprofile">
              <label>MY PROFILE</label>
            </div>
            {userData.map((user, index) => (
              <div key={user.id}>
                <label>Name :</label>
        <input className="form-inputs" value={user.name} onChange={(e) => handleInputChange(index, 'name', e)}/>
        <br />
        <label>Batch :</label>
        <input className="form-inputs" readOnly value={user.batch}/>
        <br />
        <label >Department :</label>
        <input className="form-inputs" readOnly value={user.department}/>
        <br />
        <label >Roll No :</label>
        <input className="form-inputs" readOnly value={user.rollNo}/>
        <br />
        <label >University Register No :</label>
        <input className="form-inputs" readOnly value={user.universityRegistrationNo}/>
        <br />
        <label >Admission No :</label>
        <input className="form-inputs" readOnly value={user.admissionNo}/>
        <br />
        <label >Email :</label>
        <input className="form-inputs" readOnly value={user.email}/>
        <br />
        <label >Date Of Birth :</label>
        <input className="form-inputs" value={user.dob} onChange={(e) => handleInputChange(index, 'dob', e)}/>
        <br />
        <label >Gender :</label>
        <input className="form-inputs" value={user.gender} onChange={(e) => handleInputChange(index, 'gender', e)}/>
        <br />
        <label >Religion :</label>
        <input className="form-inputs" value={user.religion} onChange={(e) => handleInputChange(index, 'religion', e)}/>
        <br />
        <label >Caste :</label>
        <input className="form-inputs" value={user.caste} onChange={(e) => handleInputChange(index, 'caste', e)}/>
        <br />
        <label >Aadhaar No :</label>
        <input className="form-inputs" readOnly value={user.adhaarNo}/>
        <br />
        <label >Father :</label>
        <input className="form-inputs" readOnly value={user.fatherName}/>
        <br />
        <label >Mother :</label>
        <input className="form-inputs" readOnly value={user.motherName}/>
        <br />
        <label >Address :</label>
        <input className="form-inputs" value={user.permanentAddress} onChange={(e) => handleInputChange(index, 'address', e)}/>
        <br />
        <label >State :</label>
        <input className="form-inputs" readOnly value={user.state}/>
        <br />
        <label >Student Phone :</label>
        <input className="form-inputs" value={user.studentPhone} onChange={(e) => handleInputChange(index, 'studentphone', e)}/>
        <br />
        <label >Parent Phone :</label>
        <input className="form-inputs" readOnly value={user.parentPhone}/>
        <br />
        <label >Admission Date :</label>
        <input className="form-inputs" readOnly value={user.admissionDate}/>
        <br />
        <label >Admission Quota :</label>
        <input className="form-inputs" readOnly value={user.admisstionQuota}/>
        <br />
        <label >Tenth Percentage :</label>
        <input className="form-inputs" readOnly value={user.tenthPercentage}/>
        <br />
        <label >Twelth Percentage :</label>
        <input className="form-inputs" readOnly value={user.twelfthPercentage}/>
        <br />
                <label>Profile Picture:</label>
                <input className="upload-pic" type="file" onChange={handleImageUpload} />
                <br />
                <br />
                <button type="submit" className="profile">
                  SUBMIT
                </button>
              </div>
            ))}
          </form>
        </div>
        <UploadResume isOpen={model} closeModel={toggleModel} />
        <Logout isOpened={models} closeModels={toggleModels} />
      </div>
    </>
  );
};

export default StudentProfile;
