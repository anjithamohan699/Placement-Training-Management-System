import React, { useState } from 'react'
import "./AdminInterface.css";
import { Link } from 'react-router-dom';
import { IoMdHome , IoMdPersonAdd } from "react-icons/io";
import { IoLogOutOutline } from "react-icons/io5";

function AdminInterface() {

    const [activeTab,setActiveTab] = useState("Home");
    
      function redirectToSignUp(){
        setActiveTab('Create Account')
      }

      function redirectToAdminHome(){
        setActiveTab('Home')
      }

      function redirectToAdminLogout(){
        setActiveTab('Logout')
      }

  return (
    <>
      <div className="navbar">
        <div className="first-portion">
          <div className="logo">
            <label>ALBERTIAN INSTITUTE OF SCIENCE AND TECHNOLOGY (AISAT)</label>
          </div>
        </div>
        <div className='last-portion'>
          <ul>
            <li>
                <Link to='/admin'>
                  <p className={`${activeTab === "Home" ? 'active':""}`}
                  onClick= {redirectToAdminHome} > <IoMdHome /> Home </p>
                </Link>
            </li>
            <li>
                <Link to='/signup'>
                  <p className={`${activeTab === "Create Account" ? 'active':""}`}
                  onClick= {redirectToSignUp} > <IoMdPersonAdd /> Create Account </p>
                </Link>
            </li>
            <li>
                <Link to='/'>
                  <p className={`${activeTab === "Logout" ? 'active':""}`}
                  onClick= {redirectToAdminLogout}> <IoLogOutOutline className="icons"/> Logout</p>
                </Link>
            </li>
            </ul>
        </div>
    </div>
    </>
  )
}

export default AdminInterface
