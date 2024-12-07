import React, { useState, useEffect, useContext, useRef } from 'react';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';
import SentimentChart from './SentimentChart';
import '../ChatFetcher.scss';
import Back from "../img/back.png";
import { useNavigate } from 'react-router-dom';
import file from "../img/file.png";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Sentiment from 'sentiment'; // Import Sentiment.js

const ChatFetcher = () => {
    const pdfRef = useRef();
    const [chats, setChats] = useState([]);
    const [sentimentResults, setSentimentResults] = useState([]);
    const { currentUser } = useContext(AuthContext);
    const { data } = useContext(ChatContext);
    const navigate = useNavigate();
    const sentiment = new Sentiment(); // Initialize Sentiment.js

    const handleDownload = async () => {
        const element = pdfRef.current;
        const canvas = await html2canvas(element, {
            scale: 2, // Increase scale for better quality
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait', // Can also be 'landscape'
            unit: 'pt',
            format: 'a4', // A4 paper size
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const imgWidth = canvas.width;
        const imgHeight = canvas.height;

        // Calculate scaling factor to fit content within one page
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgScaledWidth = imgWidth * ratio;
        const imgScaledHeight = imgHeight * ratio;

        // Centering the image on the page
        const xOffset = (pdfWidth - imgScaledWidth) / 2;
        const yOffset = (pdfHeight - imgScaledHeight) / 2;

        pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgScaledWidth, imgScaledHeight);
        pdf.save('Chat_analyzation.pdf');
    };

    useEffect(() => {
        if (!currentUser || !data.user.uid) return;

        const chatId = currentUser.uid > data.user.uid ? currentUser.uid + data.user.uid : data.user.uid + currentUser.uid;
        const unsub = onSnapshot(doc(db, "chats", chatId), (doc) => {
            if (doc.exists()) {
                const chatMessages = doc.data().messages || [];
                setChats(chatMessages);
                analyzeSentiments(chatMessages);
            }
        });

        return () => unsub();
    }, [currentUser, data.user.uid]);

    const analyzeSentiments = (messages) => {
        const results = messages.map((message) => {
            const analysis = sentiment.analyze(message.text || ''); // Perform sentiment analysis
            const sentimentScore = analysis.score; // Sentiment score
            let sentimentLabel;

            // Determine the sentiment label based on the score
            if (sentimentScore > 0) {
                sentimentLabel = 'Positive';
            } else if (sentimentScore < 0) {
                sentimentLabel = 'Negative';
            } else {
                sentimentLabel = 'Neutral';
            }

            return {
                ...message,
                sentiment: sentimentLabel,
            };
        });
        setSentimentResults(results);
    };

    const handleBack = () => navigate(-1);

    return (
        <div className='chatsFetched' ref={pdfRef}>
            <img className='backIcon' src={Back} alt="Back" onClick={handleBack} />
            <img src={file} alt="Download Sentiment Analysis" className='logo' onClick={handleDownload} />
            <div className="chartsContainer">
                <SentimentChart sentimentResults={sentimentResults} />
            </div>
            <h2>Chats Sentiments</h2>
            {sentimentResults.length > 0 ? (
                <ul>
                    {sentimentResults.map((chat, index) => (
                        <li key={index}>
                            <strong>{chat.senderId === currentUser.uid ? "You" : data.user.displayName}:</strong> {chat.text}
                            <span className={`sentimentLabel ${chat.sentiment}`}>{' '}({chat.sentiment})</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No messages found.</p>
            )}
        </div>
    );
};

export default ChatFetcher;
