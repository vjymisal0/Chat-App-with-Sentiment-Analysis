import React, { useContext, useState } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { AuthContext } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import cam from "../img/info.png";


const Navbar = () => {
  const { currentUser } = useContext(AuthContext);
  const [isChatFetcherVisible, setIsChatFetcherVisible] = useState(false);
  const navigate = useNavigate();
  const handleClick = () => {
    // Toggle the state
    setIsChatFetcherVisible(!isChatFetcherVisible);
    // Navigate to "/selfAnalization" route when clicked
    navigate("/selfAnalization");
  };

  return (
    <div className='navbar'>
      {/* <span className="logo">
        Chat App
      </span> */}
      <div className="user">

        <img src={currentUser.photoURL} alt="" />
        <span>{currentUser.displayName}</span>
        <div className="chatIcons">
          <img
            src={cam}
            alt="Camera Icon"
            onClick={handleClick}
            style={{ cursor: 'pointer' }} // Add pointer cursor for better UX
          />
        </div>
        <button className='btnLogout' onClick={() => signOut(auth)}>logout</button>
      </div>
    </div>
  )
}

export default Navbar