import React, { useContext, useState } from 'react';
import cam from "../img/cam.png";
import Messages from './Messages';
import Input from "./Input";
import { ChatContext } from '../context/ChatContext';
import ChatFetcher from './ChatFetcher';
import { Navigate } from 'react-router-dom';

const Chat = () => {
  const { data } = useContext(ChatContext);
  const [isChatFetcherVisible, setIsChatFetcherVisible] = useState(false);

  const handleCamClick = () => {
    setIsChatFetcherVisible(!isChatFetcherVisible);
  };



  return (
    <div className='chat'>
      <div className="chatInfo">
        <span>{data.user?.displayName}</span>
        <div className="chatIcons">
          <img
            src={cam}
            alt="Camera Icon"
            onClick={handleCamClick}
            style={{ cursor: 'pointer' }} // Add pointer cursor for better UX
          />
        </div>
      </div>
      {isChatFetcherVisible ? (
        // <ChatFetcher />
        <Navigate to="/chatfetcher" />
      ) : (
        <>
          <Messages />
          <Input />
        </>
      )}
    </div>
  );
};

export default Chat;
