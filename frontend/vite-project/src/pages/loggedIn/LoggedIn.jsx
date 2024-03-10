import React from 'react';
import { auth , handleButtonClick, handleGoogleSignIn} from '../../firebaseConfig';
import { createUserWithEmailAndPassword , onAuthStateChanged} from 'firebase/auth';
import { useState , useEffect} from 'react';
import { Footer, Navbar, Hero } from '../login/Login';
import { Link , useNavigate} from 'react-router-dom';

export default function LoggedIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          // User is signed in
          setCurrentUser(user);
        } else {
          // User is signed out
          setCurrentUser(null);
          navigate("/");
        }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [navigate]);

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar loggedIn={currentUser ? true : false} handleButtonClick={() => handleButtonClick(currentUser)}/>
            <div className="flex w-full pt-40 pb-40"> 
            <div className="flex-grow">
            <Hero/> 
            </div>
            <div className="flex-initial ml-4 mr-60">
            <div>
        <div className='flex flex-col '>
          <Link to="/submit" className='transition-all duration-300 hover:bg-green-200 font-bold bg-green-button border-2 border-black rounded-md w-80 h-20 flex justify-center items-center m-4'>Upload Medical Documents</Link>
          <Link to="/search" className='transition-all duration-300 hover:bg-green-200 font-bold bg-green-button border-2 border-black rounded-md w-80 h-20 flex justify-center items-center m-4'>View Patient Data</Link>
        </div>
      </div>
            </div>
            </div>
            <Footer />
        </div>
    )
};