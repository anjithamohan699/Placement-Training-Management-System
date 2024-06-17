import React, { useState } from 'react'
import './SignUp.css'
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth , database } from '../Firebase';
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import toast, { Toaster } from 'react-hot-toast';
import { useCookies } from 'react-cookie'
import { Link, useNavigate ,NavLink} from 'react-router-dom';
import { IoLogOutOutline } from 'react-icons/io5';
import { IoMdHome, IoMdPersonAdd } from 'react-icons/io';
import Logout from './Logout';

function SignUp() {

  const docRef = useState()
  const [cookie, setCookie] = useCookies(['user']);

  //const [activeTab,setActiveTab] = useState("Home");
    
  const navigate =useNavigate();

  function redirectToSignUp() {
    navigate("/signup");
  }

  function redirectToAdminHome() {
    navigate("/admin");
  }

  function redirectToAdminLogout(){
    toggleModels();
  }

  const [models, setModels] = useState(false);
  const toggleModels = () => {
    setModels(!models);
  };

  async function signUp() {

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User signed up:', userCredential.user);
      const docRef = await addDoc(collection(database, 'Users'), {
        name: fullname,
        username: username,
        email: email,
        role: userRole,
      });

      const userid = docRef.id;
      await updateDoc(doc(database, 'Users', userid), {
        id: userid,
      });
      
      setCookie('user-id', userid, { path: '/' ,sameSite: 'none' , secure: true }); 
      toast.success("Successfully created an account!");  
    }
    catch (error) {
      toast.error('Account creation failed:', error);
    }
    
  }
    
      const [email,setEmail] = useState("");
      const [password,setPassword] = useState("");
      const [fullname,setFullname] = useState("");
      const [username,setUsername] = useState("");
      const [user,setUser] = useState(null);
      const [userRole, setUserRole] = useState("");

  return (
    <>
    <Toaster closeOnClick position="bottom-right" autoClose={2000} />
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
      <div className="background-signup"> 
          <p className="signup">Sign up</p>
          <input className="input-signup" type="email" placeholder="Full Name" onChange={(e) =>setFullname(e.target.value)}/>
          <input className="input-signup" type="email" placeholder="Email" onChange={(e) =>setEmail(e.target.value)}/>
          <input className="input-signup" type="email" placeholder="Username" onChange={(e) =>setUsername(e.target.value)}/>
          <input className="input-signup" type="password" placeholder="Password" onChange={(e) =>setPassword(e.target.value)}/>
          <input className="input-signup" type="email" placeholder="Role" onChange={(e) =>setUserRole(e.target.value)}/>
          <button className="submit-signup" type="button" onClick={signUp}>SIGN UP</button>
          <Logout isOpened={models} closeModels={toggleModels} />
        </div>
    </>
  )
}

export default SignUp;

