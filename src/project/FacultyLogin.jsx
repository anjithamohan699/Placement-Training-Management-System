import React, { useState } from 'react'
import "./Login.css";
import Navbar from './Navbar';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth , database } from '../Firebase';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import toast, { Toaster } from 'react-hot-toast';
import { useCookies } from 'react-cookie';

function FacultyLogin() {

  const navigate = useNavigate();
  const [cookie, setCookie] = useCookies(["email"]);
  const [loginEmail,setloginEmail] = useState("");
  const [loginPassword,setloginPassword] = useState("");
  const [user,setUser] = useState(null);
    
      const login = () => {
        signInWithEmailAndPassword(auth, loginEmail, loginPassword)
          .then(async (userCredential) => {
            const user = userCredential.user;
            const querySnapshot = await getDocs(
              query(
                collection(database, "Users"),
                where("email", "==", loginEmail)
              )
            );

            const maxAge = 10 * 24 * 60 * 60; // Cookie will be valid for 10 days
            setCookie("email", user.email, {
              path: "/",
              maxAge,
              sameSite: "none",
              secure: true,
            });
    
            if (!querySnapshot.empty) {
              const userData = querySnapshot.docs[0].data();
              setUser(userData);
              
              if (userData.role === "faculty") {
                toast("Logged in successfully!");
                navigate("/faculty");
              }
            else {
              toast("Incorrect email or password");
            }
          }
          })
          .catch((err) => {
            const error = err.message;
            toast.error(error);
            console.log(err.message);
          });
      };

  function handleForgotPassword(){
    navigate('/forgotpassword');
  }

  return (
    <>
      <Toaster closeOnClick position="bottom-right" autoClose={2000} />
      <Navbar/>
      <div>
        <div className="background"> 
          <p className="login">Login</p>
          <input className="input-login" type="email" placeholder="Email"onChange={(e) =>setloginEmail(e.target.value)}/>
          <input className="input-login" type="password" placeholder="Password"onChange={(e) =>setloginPassword(e.target.value)}/>
          <button className="submit-login" type="button" onClick={login}>LOGIN</button>
          <p className='password-forgot' onClick={handleForgotPassword}>Forgot Password?</p>
        </div>
      </div>
    </>
  )
}

export default FacultyLogin
