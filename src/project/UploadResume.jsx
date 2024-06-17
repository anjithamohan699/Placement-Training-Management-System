import React, { useEffect, useState } from 'react';
import "./UploadResume.css";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 } from "uuid";
import { storage, database } from '../Firebase'; // Assuming you have `database` and `storage` exported from Firebase.
import toast, { Toaster } from 'react-hot-toast';
import { useCookies } from 'react-cookie';
import { addDoc, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore'; // Import Firestore functions.

function UploadResume({ isOpen, closeModel }) {
  const [imageUpload, setImageUpload] = useState(null);
  const [cookie] = useCookies(["email"]);

  const uploadFile = () => {
    if (imageUpload == null) return;
    const imageRef = ref(storage, `Resume/${imageUpload.name + v4()}`);
    uploadBytes(imageRef, imageUpload).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
        // Save URL to Firestore
        if (cookie.email) {
          addResumeToFirestore(url);
        }
        toast.success("Successfully Uploaded");
        console.log("upload successfully");
        console.log("Uploaded resume URL:", url);
        // Reset file input
        setImageUpload(null);
        // Close modal
        closeModel();
      }).catch(error => {
        console.error('Error getting download URL:', error);
      });
    }).catch(error => {
      console.error('Error uploading file:', error);
    });
  };

  const addResumeToFirestore = async (url) => {
    try {
      const userRef = collection(database, 'students');
      const q = query(userRef, where('email', '==', cookie.email));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        try {
          await updateDoc(doc.ref, {
            resume_url: url,
          });
          console.log('Resume URL submitted successfully to Firestore for user:', doc.id);
        } catch (error) {
          console.error('Error updating resume URL for user:', doc.id, error);
        }
      });
    } catch (error) {
      console.error('Error querying Firestore for user:', error);
    }
  };

  const handleCancel = () => {
    // Reset file input
    setImageUpload(null);
    // Close modal
    closeModel();
  };

  return (
    <>
    <Toaster closeOnClick position="bottom-right" autoClose={2000} />
      {isOpen && (
        <div>
          <div onClick={closeModel} className="overlay"></div>
          <div className="modal-content">
            <h4>UPLOAD RESUME</h4>
            <input className='resume-input-new'
              type="file"
              onChange={(event) => {
                setImageUpload(event.target.files[0]);
              }}
            />
            <br/>
            <div className='btn-outline-div'>
              <button className='cancel-btns' onClick={handleCancel}> Cancel</button>
              <button className='upload-btn' onClick={uploadFile}> Upload</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default UploadResume;
