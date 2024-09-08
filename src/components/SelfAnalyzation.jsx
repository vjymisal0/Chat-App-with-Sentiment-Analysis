import React, { useState, useEffect, useContext } from 'react';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { AuthContext } from '../context/AuthContext';
import Sentiment from 'sentiment';
import SentimentChart from './SentimentChart';
import Back from "../img/back.png";
import { useNavigate } from 'react-router-dom';
import "../ChatFetcher.scss";
// import "../style.scss";


const SelfAnalyzation = () => {
    const [userMessages, setUserMessages] = useState([]);
    const [sentimentResults, setSentimentResults] = useState([]);
    const { currentUser } = useContext(AuthContext);
    const sentiment = new Sentiment();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSelfMessages = () => {
            if (!currentUser) return;

            // Fetch the selfMessages document associated with the current user
            const selfMessagesRef = doc(db, "selfMessages", currentUser.uid);

            const unsub = onSnapshot(selfMessagesRef, (snapshot) => {
                if (snapshot.exists()) {
                    const messages = snapshot.data().messages || [];
                    setUserMessages(messages);
                    analyzeSentiments(messages);
                } else {
                    setUserMessages([]);
                    setSentimentResults([]);
                }
            });

            return () => unsub();
        };

        fetchSelfMessages();
    }, [currentUser]);

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
        <div className='selfAnalyzation'>
            <img className='backIcon' src={Back} alt="back" onClick={handleBack} />
            <h2>Your Messages</h2>
            {sentimentResults.length > 0 ? (
                <>
                    <ul>
                        {sentimentResults.map((message, index) => (
                            <li key={index}>
                                <strong>You:</strong> {message.text}
                                <span className={`sentimentLabel ${message.sentiment}`}>
                                    {' '}({message.sentiment})
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

export default SelfAnalyzation;