import React from "react";
import "./Home.css";
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
    
      function redirectToStudent(){
        navigate('/login');
      }

      function redirectToFaculty(){
        navigate('/facultylogin');
      }

      function redirectToAdmin(){
        navigate('/adminlogin');
      }
  
  return (
    <>
     <Navbar/>
      <div className="container">
        <div className="bgimg">
          <img
            className="image"
            src="https://www.igecsagar.ac.in/images/Departments_picture/Picture1.png"
          ></img>
        </div>
        <div className="user-login">
          <h2>
            <p>
              <b>Albertian Institute of Science and Technology (AISAT)</b>
            </p>
          </h2>
          <button className="user" onClick={redirectToAdmin}>
            <p>
              <b>Admin</b> Login
            </p>
          </button>
          <button className="user" onClick={redirectToFaculty}>
            <p>
              <b>P&T Coordinator</b> Login
            </p>
          </button>
          <button className="user" onClick={redirectToStudent}>
            <p>
              <b>Student</b> Login
            </p>
          </button>
        </div>
      </div>
    </>
  )
}

export default Home;
