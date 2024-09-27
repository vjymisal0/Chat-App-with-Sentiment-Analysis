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
        <span>{data.user?.displayName || "Click on Users to Chat"}</span>

        {data.user?.displayName ? <div className="chatIcons">
          <img
            src={data.user?.displayName ? cam : null}
            alt=""
            onClick={handleCamClick}
            style={{ cursor: 'pointer' }} // Add pointer cursor for better UX
          />

        </div> : null}

      </div>
      {isChatFetcherVisible ? (
        // <ChatFetcher />
        <Navigate to="/chatfetcher" />
      ) : (
        <>
          <Messages />
          {/* <Input /> */}
          {data.user?.displayName && <Input />}
        </>
      )}
    </div>
  );
};

export default Chat;
