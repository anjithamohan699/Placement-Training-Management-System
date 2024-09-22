import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { database } from './../Firebase';

function CompanyBatch9() {
  const [csvData, setCsvData] = useState([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

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

  const uploadToFirestore = () => {
    const companyDetailsCollectionRef = collection(database, "companyDetails_batch8");

    csvData.forEach((data) => {
      // Extract data for Company Wise Details
      const {
        companyName,
        numPlaced,
      } = data;

      // Add Company Wise Details to Firestore
      addDoc(companyDetailsCollectionRef, {
        companyName,
        numPlaced,
      })
      .then(() => {
        console.log("Company Wise Details added to Firestore");
      })
      .catch((error) => {
        console.error("Error adding Company Wise Details to Firestore: ", error);
      });

    });
  };

  const parseCSVData = (csv) => {
    const lines = csv.split('\n');

    const nonEmptyLines = lines.filter((line) => line !== '');
    const data = nonEmptyLines.map((line) => {
      const values = line.split(",");
      return {
        companyName: values[0],
        noPlaced: values[1],
        // Add other fields for Company Wise Details here
      };
    });
    return data;
  };

  return (
    <div>
      <input type="file" onChange={handleFileUpload} />
      <button onClick={uploadToFirestore}>Upload</button>
      {progress > 0 && <p>Upload progress: {progress}%</p>}
      {error && <p>{error.message}</p>}
    </div>
  );
}

export default CompanyBatch9;