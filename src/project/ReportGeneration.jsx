import React, { useState, useEffect } from 'react';
import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { database } from '../Firebase';
import './ReportGeneration.css';
import Logout from './Logout';
import { IoLogOutOutline } from 'react-icons/io5';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import { IoMdHome } from 'react-icons/io';
import { useCookies } from 'react-cookie';

const ReportGeneration = () => {

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

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [reportDate, setReportDate] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventUrl, setEventUrl] = useState('');
  const [reportFrom, setReportFrom] = useState('');
  const [reportTo, setReportTo] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [academicDept, setAcademicDept] = useState('');
  const [batch, setBatch] = useState('');
  const storage = getStorage();
  const auth = getAuth();

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
        const snapshot = await getDocs(collection(database, 'Events'));
        const eventList = snapshot.docs.map((doc) => doc.data().eventName);
        setEvents(eventList);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);


  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const querySnapshot = await getDocs(collection(database, 'Attendance'));
        const groupedAttendance = {};
        let fetchedBatch = '';
  
        querySnapshot.forEach((doc) => {
          const { attendance, session, department,batch} = doc.data();
          if (department === academicDept) { // Filter by selected academicDept
            fetchedBatch = batch; // Set batch for the selected department
            attendance.forEach((record) => {
              const key = record.name + record.rollNo; // Using name and rollNo as the unique key
              if (!groupedAttendance[key]) {
                groupedAttendance[key] = {
                  name: record.name,
                  rollNo: record.rollNo,
                  sessions: {},
                };
              }
              groupedAttendance[key].sessions[session] = record.status;
            });
          }
        });
  
        // Convert groupedAttendance object to an array and ensure all objects are properly converted
        const attendanceArray = Object.values(groupedAttendance).map((student) => ({
          name: student.name,
          rollNo: student.rollNo,
          sessions: student.sessions, // Ensure sessions object is properly formatted
        }));
  
        // Sort the attendance data by student's roll number in increasing order
        attendanceArray.sort((a, b) => a.rollNo - b.rollNo);
  
        setAttendanceData(attendanceArray);
        setBatch(fetchedBatch); // Set the fetched batch
      } catch (error) {
        console.error('Error fetching attendance:', error);
      }
    };
  
    fetchAttendance();
  }, [academicDept]); 
  


  const fetchEventDescription = async (eventName) => {
    console.log('Fetching event description for:', eventName, academicDept);

    try {
      const q = query(
        collection(database, 'eventDescriptions'),
        where('eventName', '==', eventName),
        where('academicDept', '==', academicDept)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        console.log('Fetched event description data:', data);
        setEventDescription(data.eventDescription);
        setEventUrl(data.eventUrl);
        setReportFrom(data.reportFrom);
        setReportTo(data.reportTo);
      } else {
        console.log('No matching event description found.');
        // Clear state if needed
      }
    } catch (error) {
      console.error('Error fetching event description:', error);
      // Handle error
    }
  };

  const handleEventChange = (event) => {
    const selectedEvent = event.target.value;
    setSelectedEvent(selectedEvent);
    fetchEventDescription(selectedEvent);
  };

  const handleDateChange = (event) => {
    setReportDate(event.target.value);
  };

  const handleGenerateReport = async () => {
    try {
      const pdf = new jsPDF('p', 'pt', 'a4');
  
      // Header Content
      const collegeName = 'Albertian Institute of Science and Technology';
      const collegeNameWidth = pdf.getStringUnitWidth(collegeName) * 20;
      const collegeCenterX = (pdf.internal.pageSize.getWidth() - collegeNameWidth) / 2;
      pdf.setFontSize(20);
      pdf.text(collegeName, 140, 60);
  
      const collegeName1 = 'Technical Campus School Of Engineering';
      const collegeNameWidth1 = pdf.getStringUnitWidth(collegeName1) * 20;
      const collegeCenterX1 = (pdf.internal.pageSize.getWidth() - collegeNameWidth1) / 2;
      pdf.setFontSize(15);
      pdf.text(collegeName1, 200, 85);
  
      // Load emblem image
      const emblemUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/AISAT_Logo.webp/250px-AISAT_Logo.webp.png?20220326105306';
      const emblemImg = new Image();
      emblemImg.src = emblemUrl;
      await new Promise((resolve, reject) => {
        emblemImg.onload = () => resolve();
        emblemImg.onerror = (error) => reject(error);
      });
      pdf.addImage(emblemImg, 'PNG', 40, 30, 80, 80);
  
      // Event Name
      let mainHeadingFontSize = 18;
      const mainHeading = `REPORT ON ${selectedEvent.toUpperCase()}`;
      let mainHeadingWidth = pdf.getStringUnitWidth(mainHeading) * mainHeadingFontSize;
      const availableWidth = pdf.internal.pageSize.getWidth() - 40 * 2;
      while (mainHeadingWidth > availableWidth) {
        mainHeadingFontSize -= 1;
        mainHeadingWidth = pdf.getStringUnitWidth(mainHeading) * mainHeadingFontSize;
      }
      const mainHeadingCenterX = (pdf.internal.pageSize.getWidth() - mainHeadingWidth) / 2;
      const mainHeadingY = 140;
      pdf.setFontSize(mainHeadingFontSize);
      pdf.setFont('helvetica');
      pdf.text(mainHeading, mainHeadingCenterX, mainHeadingY);
      const mainHeadingUnderlineY = mainHeadingY + 2;
      pdf.setLineWidth(0.4);
      pdf.line(mainHeadingCenterX, mainHeadingUnderlineY, mainHeadingCenterX + mainHeadingWidth, mainHeadingUnderlineY);

      // Render batch information
    const batchText = `For eligible students of ${batch || 'N/A'}`; // Use 'N/A' if batch is not available
    const batchTextWidth = pdf.getStringUnitWidth(batchText) * 12;
    const batchX = (pdf.internal.pageSize.getWidth() - batchTextWidth) / 2;
    const batchY = mainHeadingY + 20; // Position below mainHeading
    pdf.setFontSize(12);
    pdf.text(batchText, batchX, batchY);


    // Fetch and render eventDate from eventDescriptions collection
    if (selectedEvent && academicDept) {
      const q = query(
        collection(database, 'eventDescriptions'),
        where('eventName', '==', selectedEvent),
        where('academicDept', '==', academicDept)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const eventDescriptionData = snapshot.docs[0].data();
        const eventDate = eventDescriptionData.eventDate;

        // Format eventDate like "26th April 2024"
        const formattedEventDate = formatDate(eventDate);
        const eventDateText = `On ${formattedEventDate || 'N/A'}`;
        const eventDateTextWidth = pdf.getStringUnitWidth(eventDateText) * 12;
        const eventDateX = (pdf.internal.pageSize.getWidth() - eventDateTextWidth) / 2;
        const eventDateY = batchY + 20; // Position below batchText
        pdf.text(eventDateText, eventDateX, eventDateY);
      }
    }


    
    // Date
      const dateText = `Date: ${reportDate || 'DD/MM/YY'}`;
      const dateTextWidth = pdf.getStringUnitWidth(dateText) * 18;
      const dateX = pdf.internal.pageSize.getWidth() - 40 - dateTextWidth;
      const dateY = mainHeadingY + 80;
      pdf.setFontSize(15);
      pdf.text(dateText, dateX, dateY);
  
      // Overview
      const overviewText = 'OVERVIEW';
      const overviewX = 40;
      let overviewY = dateY + 40;
      pdf.setFontSize(15);
      pdf.setFont('helvetica', 'bold');
      pdf.text(overviewText, overviewX, overviewY);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
  
      // Event description
      if (eventDescription) {
        const eventDescriptionLines = pdf.splitTextToSize(eventDescription, 500);
        overviewY += 20;
        pdf.text(eventDescriptionLines, overviewX, overviewY);
        overviewY += pdf.getTextDimensions(eventDescriptionLines).h + 20; // Update overviewY after adding description
      }
  
      // Attendance Table
      if (academicDept && attendanceData.length > 0) {
        const columnWidth = 70;
        const tableHeaders = ['Roll No.', 'Name', 'Session 1', 'Session 2', 'Session 3'];
        const tableData = attendanceData.map((student) => [
          student.rollNo,
          student.name,
          ...Object.values(student.sessions).map((status) => status || '-'),
        ]);
        const tableOptions = {
          startY: overviewY + 20, // Start below the overview content
          head: [tableHeaders],
          body: tableData,
          theme: 'grid',
          columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 230 },
            2: { cellWidth: columnWidth },
            3: { cellWidth: columnWidth },
            4: { cellWidth: columnWidth },
          },
        };
        pdf.autoTable(tableOptions);
        overviewY = pdf.previousAutoTable.finalY + 30; // Update overviewY after adding table
      }
  
      // Event Photo
      if (eventUrl) {
        const img = new Image();
        img.src = eventUrl;
        await new Promise((resolve) => {
          img.onload = () => resolve();
        });
        const imageWidth = 500;
        const imageHeight = 300;
        const imageX = 40; // X-coordinate for the image
        let imageY = overviewY + -5; // Y-coordinate for the image, below the attendance table
  
        // Check if image fits on the current page
        const remainingSpace = pdf.internal.pageSize.getHeight() - imageY;
        if (remainingSpace < imageHeight) {
          // Add a new page if image exceeds remaining space
          pdf.addPage();
          imageY = 40; // Reset Y-coordinate for the new page
        }
  
        // Add image to the PDF
        pdf.addImage(img, 'PNG', imageX, imageY, imageWidth, imageHeight);
  
        // Calculate the position for "From" and "To" text
        const textY = imageY + imageHeight + 50; // Y-coordinate for the text below the image
        const leftX = 50; // X-coordinate for "To" text aligned to the left
        const rightX = pdf.internal.pageSize.getWidth() - 50; // X-coordinate for "From" text aligned to the right
  
        // Set font size and alignment for the text
        pdf.setFontSize(12);
  
        // Draw "From" text aligned to the right
        if (reportFrom) {
pdf.text(`Report generated by 

${reportFrom}`, leftX, textY, { align: 'left' });
        }
  
        // Draw "To" text aligned to the left
        if (reportTo) {
 pdf.text(`

           ${reportTo}`, rightX, textY, { align: 'right' });
        }
      }
  
      // Save and open PDF
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
  
      setSelectedEvent('');
      setReportDate('');
  
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };


  // Function to format date like "26th April 2024"
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();
  const formattedDate = `${ordinalSuffix(day)} ${month} ${year}`;
  return formattedDate;
};

// Function to add ordinal suffix to day (e.g., 1st, 2nd, 3rd, ...)
const ordinalSuffix = (day) => {
  if (day > 3 && day < 21) return `${day}th`;
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
};
  
  const handleDepartmentChange = (event) => {
    const academicDept = event.target.value;
    setAcademicDept(academicDept);
    fetchEventDescription(selectedEvent, academicDept);
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

    <div className="report-div">
      <h1>REPORT GENERATION</h1>
      <div className="input-field-report">
        <label htmlFor="event-select-report">Event:</label>
        <select id="event-select-report" value={selectedEvent} onChange={handleEventChange}>
          <option value="">Select an event</option>
          {events.map((event, index) => (
            <option key={index} value={event}>
              {event}
            </option>
          ))}
        </select>
      </div>
      <div className="input-field-report">
        <label htmlFor="report-date">Date:</label>
        <input
          type="text"
          id="report-date"
          value={reportDate}
          onChange={handleDateChange}
          placeholder="DD/MM/YY"
        />
      </div>
      <div className="department-input-report">
        <label htmlFor="department-input-report">Department:</label>
        <input
          type="text"
          id="department-input-report"
          value={academicDept}
          onChange={handleDepartmentChange}
          readOnly
        />
      </div>
      <button className='report-button' onClick={handleGenerateReport}>Generate Report</button>
    </div>
    <Logout isOpened={models} closeModels={toggleModels} />
    </div>
    </>
  );
};

export default ReportGeneration;

