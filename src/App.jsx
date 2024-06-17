import React from "react";
import {Routes, Route} from 'react-router-dom';
import Home from "./project/Home";
import Login from "./project/login";
import AdminLogin from "./project/AdminLogin";
import FacultyLogin from "./project/FacultyLogin";
import SignUp from "./project/SignUp";
import StudentInterface from "./project/StudInterface";
import FacultyInterface from "./project/FacultyInterface";
import AdminInterface from "./project/AdminInterface";
import ApplyLeave from "./project/ApplyLeave";
import StudentProfile from "./project/StudentProfile";
import AdminNotification from "./project/AdminNotification";
import Inbox from "./project/Inbox";
import FacultyNotificationDisplay from "./project/FacultyNotificationDisplay";
import LeaveInbox from "./project/LeaveInbox";
import LeaveApproval from "./project/LeaveApproval";
import MarkAttendance from "./project/MarkAttendance";
import StudentResult from "./project/StudentResult";
import ForgotPassword from "./project/ForgotPassword";
import FacultyProfile from "./project/FacultyProfile";
import ResultDisplayFac from "./project/ResultDisplayFac";
import FacultyNotification from "./project/FacultyNotification";
import StudentNotificationDisplay from "./project/StudentNotificationDisplay";
import StudentDetailsDisplayAdmin from './project/StudentDetailsDisplayAdmin';
import StatisticsDisplay from "./project/StatisticsDisplay";
import ResumeDisplay from "./project/ResumeDisplay";
import AttendanceDisplayStud from "./project/AttendanceDisplayStud";
import FacultyInbox from "./project/FacultyInbox";
import EventDescription from "./project/EventDescription";
import ReportGeneration from "./project/ReportGeneration";

function App() {
  return (
    <>  
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/facultylogin" element={<FacultyLogin />}></Route> 
        <Route path="/adminlogin" element={<AdminLogin />}></Route> 
        <Route path="/signup" element={<SignUp />}></Route>
        <Route path="/student" element={<StudentInterface />}></Route>
        <Route path="/faculty" element={<FacultyInterface />}></Route>
        <Route path="/admin" element={<AdminInterface />}></Route>
        <Route path="/applyleave" element={<ApplyLeave />}></Route>
        <Route path="/studentprofile" element={<StudentProfile />}></Route>
        <Route path="/facultyprofile" element={<FacultyProfile />}></Route>
        <Route path="/admin-notification" element={<AdminNotification />}></Route>
        <Route path="/inbox" element={<Inbox />}></Route>
        <Route path="/leaveinbox" element={<LeaveInbox />}></Route>
        <Route path="/facultynotificationdisplay" element={<FacultyNotificationDisplay />}></Route>
        <Route path="/leaveapproval" element={<LeaveApproval />}></Route>
        <Route path="/markattendance" element={<MarkAttendance />}></Route>
        <Route path="/result" element={<StudentResult />}></Route>
        <Route path="/forgotpassword" element={<ForgotPassword />}></Route>
        <Route path="/studresultdisplay" element={<ResultDisplayFac />}></Route>
        <Route path="/faculty-notification" element={<FacultyNotification />}></Route>
        <Route path="/studentnotificationdisplay" element={<StudentNotificationDisplay />}></Route>
        <Route path="/studentdetails" element={<StudentDetailsDisplayAdmin />}></Route>
        <Route path="/displaystatistics" element={<StatisticsDisplay />}></Route>
        <Route path="/displayresume" element={<ResumeDisplay />}></Route>
        <Route path="/displayattendance" element={<AttendanceDisplayStud />}></Route>
        <Route path="/facultyinbox" element={<FacultyInbox />}></Route>
        <Route path="/eventdescription" element={<EventDescription />}></Route>
        <Route path="/reportgeneration" element={<ReportGeneration />}></Route>
      </Routes>
    </>
  )
}

export default App;