import "./FacultyProfile.css";
import { IoMdHome , IoIosNotifications } from "react-icons/io";
import { IoLogOutOutline } from "react-icons/io5";
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import { NavLink } from 'react-router-dom';
import { database, storage } from "../Firebase";
import { FaBell } from "react-icons/fa";
import { useCookies } from "react-cookie";
import { collection, getDocs, query, where, doc, updateDoc ,onSnapshot } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import Logout from "./Logout";

function FacultyProfile() {

        const navigate =useNavigate();
        const [csvData, setCsvData] = useState([]);
        const [progress, setProgress] = useState(0);
        const [error, setError] = useState(null);
        const [inputValue, setInputValue] = useState("");
        const [notifications, setNotifications] = useState([]);
        const [notificationCount, setNotificationCount] = useState(0);
        const [cookie, setCookie] = useCookies(["email"]);
        const [userData, setUserData] = useState([]);
        const [showModals, setShowModals] = useState(false);
        const [imageUpload, setImageUpload] = useState(null); // State to hold the uploaded image
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

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(database, 'admin_notification'), (snapshot) => {
      const updatedNotifications = snapshot.docs.map(doc => doc.data());
      setNotifications(updatedNotifications);

      // Update notification count based on unviewed notifications
      const unviewedNotifications = updatedNotifications.filter(notification => !notification.viewed);
      setNotificationCount(unviewedNotifications.length);
    });

    const handleImageUpload = async (event) => {
    const imageFile = event.target.files[0];
    try {
      const storageRef = ref(storage, `fac_profile/${userData[0].id}/${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      const imageUrl = await getDownloadURL(storageRef);
      await updateDoc(doc(database, "pt_coordinator", userData[0].id), {
        profilePictureUrl: imageUrl
      });
      setProfileImageUrl(imageUrl);
      console.log("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

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

  const handleInputChange = (index, fieldName, e) => {
    const newUserData = [...userData];
    newUserData[index][fieldName] = e.target.value;
    setUserData(newUserData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userRef = doc(database, "pt_coordinator", userData[0].id);
      await updateDoc(userRef, {
        name: userData[0].name,
        qualifications: userData[0].qualifications,
        gender: userData[0].gender,
        blood_group: userData[0].blood_group,
        birthday: userData[0].birthday,
        address: userData[0].address,
        phone: userData[0].phone,
      });

      if (imageUpload) {
        const storageRef = ref(storage, `fac_profile/${userData[0].id}/${imageUpload.name}`);
        await uploadBytes(storageRef, imageUpload);
        const imageUrl = await getDownloadURL(storageRef);
        await updateDoc(doc(database, "pt_coordinator", userData[0].id), {
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

  const handleImageUpload = async (event) => {
    const imageFile = event.target.files[0];
    try {
      const storageRef = ref(storage, `fac_profile/${userData[0].id}/${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      const imageUrl = await getDownloadURL(storageRef);
      await updateDoc(doc(database, "pt_coordinator", userData[0].id), {
        profilePictureUrl: imageUrl
      });
      setProfileImageUrl(imageUrl);
      console.log("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
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
    <div className="profile-div-fac">
          <form className="profile-form-fac" onSubmit={handleSubmit}>
            <div className="myprofile-fac">
              <label>MY PROFILE</label>
            </div>
            {userData.map((user, index) => (
              <div key={user.id}>
                <label>Name :</label>
        <input value={user.name} onChange={(e) => handleInputChange(index, 'name', e)}/>
        <br />
        <label>Academic Department :</label>
        <input readOnly value={user.academic_dept}/>
        <br />
        <label >Academic Designation :</label>
        <input readOnly value={user.academic_desig}/>
        <br />
        <label >Academic Role :</label>
        <input readOnly value={user.academic_role}/>
        <br />
        <label >HR Section :</label>
        <input readOnly value={user.hr_section}/>
        <br />
        <label >HR Designation :</label>
        <input readOnly value={user.hr_desig}/>
        <br />
        <label >Qualifications :</label>
        <input value={user.qualifications} onChange={(e) => handleInputChange(index, 'qualifications', e)}/>
        <br />
        <label >Joining Date :</label>
        <input readOnly value={user.joining_date}/>
        <br />
        <label >Gender :</label>
        <input value={user.gender} onChange={(e) => handleInputChange(index, 'gender', e)}/>
        <br />
        <label >Blood Group :</label>
        <input value={user.blood_group} onChange={(e) => handleInputChange(index, 'blood_group', e)}/>
        <br />
        <label >Email :</label>
        <input readOnly value={user.email}/>
        <br />
        <label >Birthday :</label>
        <input value={user.birthday} onChange={(e) => handleInputChange(index, 'birthday', e)}/>
        <br />
        <label >Address :</label>
        <input value={user.address} onChange={(e) => handleInputChange(index, 'address', e)}/>
        <br />
        <label >Phone :</label>
        <input value={user.phone} onChange={(e) => handleInputChange(index, 'phone', e)}/>
        <br />
        <label >Pan Card Number :</label>
        <input readOnly value={user.pan_no}/>
        <br />
        <label >Aadhaar No :</label>
        <input readOnly value={user.aadhar_no}/>
        <br />
        <label>Profile Picture:</label>
                <input className="pic-upload" type="file" onChange={handleImageUpload} />
                <br />
                <br />
                <button type="submit" className="profile-fac">
                  SUBMIT
                </button>
        </div>
        ))}
        </form>
        </div>
        <Logout isOpened={models} closeModels={toggleModels} /> 
    </div>
    </>
  )
}

export default FacultyProfile;

