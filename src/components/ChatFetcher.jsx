import React, { useState, useEffect, useContext } from 'react';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';
import Sentiment from 'sentiment';
import SentimentChart from './SentimentChart';
import '../ChatFetcher.scss'; // Import the SCSS file
import Back from "../img/back.png";
import { useNavigate } from 'react-router-dom';

const ChatFetcher = () => {
    const [chats, setChats] = useState([]);
    const [sentimentResults, setSentimentResults] = useState([]);
    const { currentUser } = useContext(AuthContext);
    const { data } = useContext(ChatContext);
    const sentiment = new Sentiment();
    const navigate = useNavigate(); // Initialize the useNavigate hook

    useEffect(() => {
        const fetchChats = () => {
            const chatId =
                currentUser.uid > data.user.uid
                    ? currentUser.uid + data.user.uid
                    : data.user.uid + currentUser.uid;

            const unsub = onSnapshot(doc(db, "chats", chatId), (doc) => {
                if (doc.exists()) {
                    const chatMessages = doc.data().messages;
                    setChats(chatMessages);
                    analyzeSentiments(chatMessages);
                }
            });

            return () => {
                unsub();
            };
        };

        if (currentUser && data.user.uid) {
            fetchChats();
        }
    }, [currentUser, data.user.uid]);

    const analyzeSentiments = (messages) => {
        const results = messages.map((message) => {
            const result = sentiment.analyze(message.text);
            return {
                ...message,
                sentiment: result.score > 0 ? 'Positive' : result.score < 0 ? 'Negative' : 'Neutral',
            };
        });
        setSentimentResults(results);
    };

    const handleBack = () => {
        navigate(-1); // Go back to the previous page
    };

    return (
        <div className='chatsFetched'>
            <img className='backIcon' src={Back} alt="back" onClick={handleBack} />
            <h2>Chat Messages</h2>
            {sentimentResults.length > 0 ? (
                <>
                    <ul>
                        {sentimentResults.map((chat, index) => (
                            <li key={index}>
                                <strong>{chat.senderId === currentUser.uid ? "You" : data.user.displayName}:</strong> {chat.text}
                                <span className={`sentimentLabel ${chat.sentiment}`}>
                                    {' '}({chat.sentiment})
                                </span>
                            </li>
                        ))}
                    </ul>
                    <div className="chartsContainer">
                        <SentimentChart sentimentResults={sentimentResults} />
                    </div>
                </>
            ) : (
                <p>No messages found.</p>
            )}
        </div>
    );
};

export default ChatFetcher;
