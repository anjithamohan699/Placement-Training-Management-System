import React, { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import './Logout.css';
import { TbLogout } from "react-icons/tb";

function Logout({ isOpened, closeModels }) {
    const [cookie, , removeCookie] = useCookies(["email"]);
    const navigate = useNavigate();

    useEffect(() => {
        const email = cookie['email'];
        if (!email && isOpened) { // Check isOpened to prevent redirect when modal is closed
            navigate('/login');
        }
    }, [cookie, isOpened, navigate]);

    function handleLogout() {
        removeCookie('email', { path: '/' });
        navigate('/');
    }

    function Cancel(){
        closeModels();
    }

    return (
        <>
            {isOpened && (
                <div className="modals">
                    <div className="overlays">
                      <div className="modal-contents">
                          <div>
                              <h4>Are you sure you want to sign out?</h4>
                              <button className='cancel-btn' onClick={Cancel}>Cancel</button>
                              <button className='log-btn' onClick={handleLogout}><TbLogout /> Logout</button>
                          </div>
                      </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Logout;
