import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import './StudentResult.css' 
import { useCookies } from 'react-cookie';
import { database } from '../Firebase';
import { IoLogOutOutline } from 'react-icons/io5';
import { IoIosNotifications, IoMdHome } from 'react-icons/io';
import { FaBell } from 'react-icons/fa';
import UploadResume from './UploadResume';
import Logout from './Logout';

const StudentResult = (props) => {

  const navigate = useNavigate();
  const [studentData, setStudentData] = useState([]);
  const { state } = useLocation();
  const [cookie, setCookie] = useCookies(["email"]);
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);

  console.log(cookie.email);

  useEffect(() => {
    const fetchDataFromFirestore = async () => {
      const querySnapshot = await getDocs(query(collection(database, 'results'), where('email', '==', cookie.email)));
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setStudentData(data);
    };

    if (cookie.email) {
      fetchDataFromFirestore();
    }
  }, [cookie.email]);

  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const querySnapshot = await getDocs(query(collection(database, "students"), where("email", "==", cookie.email)));
        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          if (userData.profilePictureUrl) {
            setProfilePictureUrl(userData.profilePictureUrl);
          }
        });
      } catch (error) {
        console.error("Error fetching profile picture:", error);
      }
    };

    if (cookie.email) {
      fetchProfilePicture();
    }
  }, [cookie.email]);

  function redirectToStudentNotification(){
    navigate('/studentnotificationdisplay')
  }

  function redirectToStudentHome(){
    navigate('/student');
  }

  function handleAttendance(){
    navigate('/displayattendance');
  }

  function handleApplyLeave(){
    navigate('/applyleave');
  }

  function redirectToStudentLogout(){
    toggleModels();
  }

  function handleProfile(){
    navigate('/studentprofile');
  }

  function handleLeaveInbox(){
    navigate('/leaveinbox');
  }

  function handleResult(){
    navigate('/result');
  }

  const [model, setModel] = useState(false);
  const toggleModel = () => {
    setModel(!model);
  };

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
          <div className='last-portions'>
            <nav>
              <NavLink className='nav-list' to='/student' onClick={redirectToStudentHome}>
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
                </div>
                 Notification 
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

      <div className='outer-container'>
        <div className="sidebar">
          <div className='image-stud'>
            {profilePictureUrl ? (
              <img className='stud-img' src={profilePictureUrl} alt='Profile' />
            ) : (
              <img className='stud-img' src='https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-portrait-176256935.jpg' alt='Default Profile' />
            )}
          </div>
          <div className="sidediv"><button className="sidebutton" onClick={handleProfile}> Profile Settings</button></div>
          <div className="sidediv"><button className="sidebutton" onClick={toggleModel}>Resume</button></div>  
          <div className="sidediv"><button className="sidebutton" onClick={handleLeaveInbox}>Applied Leave(s)</button></div>
          <div className="sidediv"><button className="sidebutton" onClick={handleAttendance}>Attendance</button></div>
          <div className="sidediv"><button className="sidebutton" onClick={handleResult}>University Results</button></div>
          <div className="sidediv"><button className="sidebutton" onClick={redirectToStudentNotification}>Notification</button></div>
          <div className="sidediv"><button className="sidebutton" onClick={handleApplyLeave}>Apply For Leave</button></div>
        </div>
      <div className='form-table-div-result' >
        <h2>SEMESTER RESULTS</h2>
        <table className='form-table-result'>
          <thead>
            <tr>
              <th>SEM</th>
              <th>SGPA</th>
              <th>CGPA</th>
              <th>Arrears</th>
            </tr>
          </thead>
          <tbody>
          {studentData.map((student, index) =>  (
            <tr key={student.id}>
              <td>S1</td>
              <td><input type="text" name="S1" readOnly value={student.s1_sgpa}/></td>
              <td><input type="text" name="CGPA_S1" readOnly value={student.s1_cgpa}/></td>
              <td><input type="text" name="Arrears_S1" readOnly value={student.s1_arrears}/></td>
            </tr>
          ))} 
          {studentData.map((student, index) =>  (
            <tr key={student.id}>
              <td>S2</td>
              <td><input type="text" name="S2" readOnly value={student.s2_sgpa}/></td>
              <td><input type="text" name="CGPA_S2" readOnly value={student.s2_cgpa}/></td>
              <td><input type="text" name="Arrears_S2" readOnly value={student.s2_arrears}/></td>
            </tr>
          ))} 
          {studentData.map((student, index) =>  (
            <tr key={student.id}>
              <td>S3</td>
              <td><input type="text" name="S3" readOnly value={student.s3_sgpa}/></td>
              <td><input type="text" name="CGPA_S3" readOnly value={student.s3_cgpa}/></td>
              <td><input type="text" name="Arrears_S3" readOnly value={student.s3_arrears}/></td>
            </tr>
          ))}
          {studentData.map((student, index) =>  (
            <tr key={student.id}>
              <td>S4</td>
              <td><input type="text" name="S4" readOnly value={student.s4_sgpa}/></td>
              <td><input type="text" name="CGPA_S4" readOnly value={student.s4_cgpa}/></td>
              <td><input type="text" name="Arrears_S4" readOnly value={student.s4_arrears}/></td>
            </tr>
          ))}
          {studentData.map((student, index) =>  (
            <tr key={student.id}>
              <td>S5</td>
              <td><input type="text" name="S5" readOnly value={student.s5_sgpa}/></td>
              <td><input type="text" name="CGPA_S5" readOnly value={student.s5_cgpa}/></td>
              <td><input type="text" name="Arrears_S5" readOnly value={student.s5_arrears}/></td>
            </tr>
          ))}
          {studentData.map((student, index) =>  (
            <tr key={student.id}>
              <td>S6</td>
              <td><input type="text" name="S6" readOnly value={student.s6_sgpa}/></td>
              <td><input type="text" name="CGPA_S6" readOnly value={student.s6_cgpa}/></td>
              <td><input type="text" name="Arrears_S6" readOnly value={student.s6_arrears}/></td>
            </tr>
          ))}
          {studentData.map((student, index) =>  (
            <tr key={student.id}>
              <td>S7</td>
              <td><input type="text" name="S7" readOnly value={student.s7_sgpa}/></td>
              <td><input type="text" name="CGPA_S7" readOnly value={student.s7_cgpa}/></td>
              <td><input type="text" name="Arrears_S7" readOnly value={student.s7_arrears}/></td>
            </tr>
          ))}
          {studentData.map((student, index) =>  (
            <tr key={student.id}>
              <td> S8 </td>
              <td><input type="text"  name="S8" readOnly value={student.s8_sgpa}/></td>
              <td><input type="text" name="CGPA_S8" readOnly value={student.s8_cgpa}/></td>
              <td><input type="text" name="Arrears_S8" readOnly value={student.s8_arrears}/></td>
            </tr>
          ))}  
          </tbody>
          
        </table>
        {studentData.map((student, index) =>  (
        <div className="total-cgpa" key={student.id}>
          <label htmlFor="Total_CGPA">Total CGPA :</label>
          <input className='cgpa-input' type="text" name="Total_CGPA" id="Total_CGPA" readOnly value={student.total__cgpa}/>
          <br />
        </div>
        ))}
    </div>
    <UploadResume isOpen={model} closeModel={toggleModel} />
    <Logout isOpened={models} closeModels={toggleModels} /> 
    </div>
    </>
  );
};

export default StudentResult;
