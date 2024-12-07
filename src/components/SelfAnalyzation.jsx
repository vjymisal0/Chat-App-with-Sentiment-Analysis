import React, { useState, useEffect, useContext, useRef } from 'react';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { AuthContext } from '../context/AuthContext';
import SentimentChart from './SentimentChart';
import Back from "../img/back.png";
import { useNavigate } from 'react-router-dom';
import file from "../img/file.png";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Sentiment from 'sentiment'; // Import Sentiment.js

const SelfAnalyzation = () => {
    const [userMessages, setUserMessages] = useState([]);
    const [sentimentResults, setSentimentResults] = useState([]);
    const { currentUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const pdfRef = useRef();
    const sentiment = new Sentiment(); // Initialize Sentiment.js

    useEffect(() => {
        const fetchSelfMessages = () => {
            if (!currentUser) return;

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
            }, (error) => {
                console.error("Error fetching self messages:", error);
            });

            return () => unsub();
        };

        fetchSelfMessages();
    }, [currentUser]);

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

    const handleBack = () => {
        navigate(-1);
    };

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
        pdf.save('self_analyzation.pdf');
    };

    return (
        <div className='selfAnalyzation' ref={pdfRef}>
            <img className='backIcon' src={Back} alt="back" onClick={handleBack} />
            <img
                src={file}
                alt={sentimentResults.length > 0 ? "Sentiment Analysis" : ""}
                className='logo'
                onClick={handleDownload}
            />
            <div className="chartsContainer">
                <SentimentChart sentimentResults={sentimentResults} />
            </div>
            <h2>Your Messages</h2>
            {sentimentResults.length > 0 ? (
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
            ) : (
                <p>No messages found.</p>
            )}
        </div>
    );
};

export default SelfAnalyzation;
