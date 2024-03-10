import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { auth, db } from '../../firebaseConfig';
import { addDoc, collection } from "firebase/firestore"; // Ensure you import addDoc and collection
import { Navbar } from '../login/Login';

// const Navbar = () => (
//   <nav className="flex justify-between items-center bg-white px-6 py-4 w-full shadow-md">
//     <img src={'/logo.png'} alt="Logo" className="h-14" />
//     <div className="flex-grow">
//       <div className="hidden md:flex space-x-4">
//         <a href="#" className="p-2 hover:bg-gray-200 rounded">Home</a>
//         <a href="#" className="p-2 hover:bg-gray-200 rounded">Blog</a>
//         <a href="#" className="p-2 hover:bg-gray-200 rounded">Pages</a>
//         <a href="#" className="p-2 hover:bg-gray-200 rounded">Contact</a>
//       </div>
//     </div>
//     <div className="flex items-center">
//       <a href="#" className="p-2 hover:bg-gray-200 rounded mr-4">Sign In</a>
//       <a href="#" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow">Register</a>
//     </div>
//   </nav>
// );

export default function SubmitFiles() {
    const [files, setFiles] = useState([]);

    const onDrop = useCallback(acceptedFiles => {
        const user = auth.currentUser;
        if (user) {
            const userID = user.uid;
            setFiles(prev => [...prev, ...acceptedFiles]);

            const formData = new FormData();
            formData.append('userID', userID);
            acceptedFiles.forEach(async (file) => {
                formData.append('pdf', file);

                const fileMetadata = {
                    userID,
                    fileName: file.name,
                    size: file.size,
                    type: file.type,
                    lastModified: file.lastModified,
                };

            });

            axios.post('http://127.0.0.1:5000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }).then(response => {
                console.log('Files uploaded successfully:', response.data);
            }).catch(error => {
                console.error('Error uploading files:', error);
            });
        } else {
            console.log("User not authenticated");
        }
    }, []);

    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop});

    return (
        <>
            <Navbar />
            <div className="container mx-auto mt-10">
                <div {...getRootProps()} style={{ border: '2px dashed #0087F7', padding: '20px', textAlign: 'center' }}>
                    <input {...getInputProps()} />
                    {
                        isDragActive ?
                        <p>Drop the files here ...</p> :
                        <p>Drag and drop some files here, or click to select files</p>
                    }
                </div>
                <ul>
                    {files.map((file, index) => (
                        <li key={index}>{file.name}</li>
                    ))}
                </ul>
            </div>
        </>
    );
}
