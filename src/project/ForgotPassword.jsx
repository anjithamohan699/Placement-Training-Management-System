import React from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../Firebase'; // Assuming 'database' is actually 'auth'
import './ForgotPassword.css';
import { IoIosLock } from "react-icons/io";
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';

function ForgotPassword() { 

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const emailValue = e.target.email.value;

        try {
            await sendPasswordResetEmail(auth, emailValue);
            alert("Check your email for password reset instructions.");
        } catch (error) {
            alert(error.code);
        }
    };

    function handleBackToLogin(){
        navigate('/')
    }

    return (
        <>
            <Navbar />
            <div className="background-forgot"> 
                <p className="reset-password"><IoIosLock style={{ fontSize: '3.5em', marginLeft: '60px' , marginTop: '65px'}}/><br />Trouble Logging In?</p>
                <p className='paragraph'>Enter your email and we'll send you a link to get back into your account</p>
                <form onSubmit={(e) => handleSubmit(e)}>
                    <input className="login-input" type="email" name="email" placeholder="Email" />
                    <button className="submit-reset" type="submit">SUBMIT</button>
                    <p className='back-to-login' onClick={handleBackToLogin}>Back to Home</p>
                </form>
            </div>
        </>
    );
}

export default ForgotPassword;
