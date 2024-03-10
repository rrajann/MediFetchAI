import React from 'react';
import { signInWithPopup , GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth, googleProvider, handleButtonClick, handleGoogleSignIn} from '../../firebaseConfig';
import { useNavigate } from 'react-router-dom';

function Auth() {

  return (
    <button onClick={handleGoogleSignIn} className="w-60 h-20 transition-all duration-300 hover:bg-green-200 bg-green-button shadow-lg">Sign in with Google</button>
  );
};

const Navbar = ({loggedIn, handleButtonClick}) => (
  <nav className="flex justify-start pl-40 items-center bg-white px-6 py-4 w-full">
    <img src={'logo.png'} alt="Logo" className="h-14" />
    <div className="ml-10 flex space-x-4">
      <a href="/" className='hover:bg-gray-200 rounded transition-all duration-300 p-2' >Home</a>
      <a href="https://devpost.com/software/medifetch-ai" className='hover:bg-gray-200 rounded transition-all duration-300 p-2'>Blog</a>
    </div>
    <button onClick={handleButtonClick} className="ml-auto mr-40 transition-all duration-300 hover:bg-green-200 text-button-text bg-green-button focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center shadow-lg">{loggedIn ? "Sign out" : "Sign in"}</button>
  </nav>
);

const Hero = () => (
  <div className="flex flex-col items-start pt-10 pb-10 pl-40">
    <h1 className="font-normal text-4xl mb-6">MediFetch AI</h1>
    <div>
      <p>Streamlined and easy medical</p>
      <p>information. All in one place.</p>
    </div>
  </div>
);

const MainImage = () => (
  <div className="w-full">
    <img src={'main-image.jpg'} alt="Main" className="w-full object-cover h-96" />
  </div>
);

const Footer = () => (
  <footer className="bg-white text-center text-sm py-4 w-full mt-auto">
    <div className="flex justify-center space-x-4">
      <a href="#">About Us</a>
      <a href="#">Privacy Policy</a>
      <a href="#">Terms of Use</a>
    </div>
  </footer>
);

function Login() { 
  const [currentUser, setCurrentUser] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        setCurrentUser(user);
        navigate("/loggedin")
      } else {
        // User is signed out
        setCurrentUser(null);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar loggedIn={currentUser ? true : false} handleButtonClick={() => handleButtonClick(currentUser)}/>
      <div className="flex w-full pt-40 pb-40"> 
        <div className="flex-grow">
          <Hero/> 
        </div>
        <div className="flex-initial flex-col justify-center ml-4 pt-12 mr-60">
          <Auth/> 
        </div>
      </div>
      <Footer />
    </div>
  )
}

export {Login, Footer, Navbar, Auth, Hero}
