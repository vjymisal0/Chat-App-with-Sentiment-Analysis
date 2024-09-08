import React, { useState, useEffect, useContext } from 'react';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';
import SentimentChart from './SentimentChart';
import '../ChatFetcher.scss'; // Import the SCSS file
import Back from "../img/back.png";
import { useNavigate } from 'react-router-dom';

// Define custom sentiment words for both English and Marathi
const positiveWords = [
    'happy', 'joyful', 'pleasant', 'good', 'great', 'awesome', 'आनंद', 'सुख', 'मस्त', 'अच्छा', 'उत्साह'
];
const abusiveWordsEnglish = [
    'abuse', 'asshole', 'bastard', 'bitch', 'bullshit', 'cunt', 'dick', 'douchebag', 'fuck', 'motherfucker',
    'piss', 'prick', 'shit', 'slut', 'whore', 'wanker', 'idiot', 'retard', 'stupid', 'jerk'
];

const abusiveWordsMarathi = [
    'गंवार', 'चालवले', 'खोटारडं', 'नालायक', 'उत्सुकता', 'बदतमीज', 'विघ्न', 'निंदा', 'फटाक्याचे',
    'रंगवले', 'कसाबात', 'असाधू', 'कुणी', 'घाणेरडा', 'कुटील', 'चुडेल', 'उत्सव', 'अस्मान', 'चिळी', 'मूर्ख', "बावळट ", "शेमण्या"
];

const negativeWords = [
    'sad', 'angry', 'upset', 'bad', 'horrible', 'terrible', 'दुख', 'खोटा', 'विघ्न', 'निराश', 'अस्वस्थ'
];
const neutralWords = [
    'okay', 'fine', 'normal', 'neutral', 'satisfactory', 'साधारण', 'विवेकी', 'तटस्थ'
];

const analyzeCustomSentiment = (text) => {
    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;
    let abusiveCount = 0;

    words.forEach(word => {
        if (positiveWords.includes(word)) {
            positiveCount++;
        } else if (negativeWords.includes(word)) {
            negativeCount++;
        } else if (neutralWords.includes(word)) {
            neutralCount++;
        } else if (abusiveWordsEnglish.includes(word) || abusiveWordsMarathi.includes(word)) {
            abusiveCount++;
        }
    });

    if (abusiveCount > 0) {
        return 'Abusive';
    } else if (positiveCount > negativeCount) {
        return 'Positive';
    } else if (negativeCount > positiveCount) {
        return 'Negative';
    } else {
        return 'Neutral';
    }
};


const ChatFetcher = () => {
    const [chats, setChats] = useState([]);
    const [sentimentResults, setSentimentResults] = useState([]);
    const { currentUser } = useContext(AuthContext);
    const { data } = useContext(ChatContext);
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
            const sentiment = analyzeCustomSentiment(message.text);
            return {
                ...message,
                sentiment,
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
            <div className="chartsContainer">
                <SentimentChart sentimentResults={sentimentResults} />
            </div>
            <h2>Chats Sentiments</h2>
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

                </>
            ) : (
                <p>No messages found.</p>
            )}
        </div>
    );
};

export default ChatFetcher;
