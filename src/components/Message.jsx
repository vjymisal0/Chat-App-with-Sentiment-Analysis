import React, { useContext, useRef, useEffect } from 'react'
import { AuthContext } from '../context/AuthContext'
import { ChatContext } from '../context/ChatContext'

const Message = ({ message }) => {
    const { currentUser } = useContext(AuthContext);
    const { data } = useContext(ChatContext);

    const ref = useRef();

    useEffect(() => {
        ref.current?.scrollIntoView({ behavior: "smooth" });
    }, [message]);

    return (
        < div ref={ref}
            className={`message ${message.senderId === currentUser.uid && "owner"}`
            }>                <div className="messageInfo">
                <img
                    src={
                        message.senderId === currentUser.uid
                            ? currentUser.photoURL
                            : data.user.photoURL
                    }
                    alt=""
                />
                <span>just now</span>
            </div>
            <div className="messageContent">
                <p>{message.text}</p>
                {message.img && <img src={message.img} alt="" />}
            </div>
            {/*   <div className='message'>
            <div className="messageInfo">
                <img src= alt="" />
                <span>Just Now</span>
            </div>
            <div className="messageContent">
                <p>Hello</p>
                <img src="https://upload.wikimedia.org/wikipedia/en/0/03/Walter_White_S5B.png" alt="" />
            </div> */}
        </div >


    )
}

export default Message