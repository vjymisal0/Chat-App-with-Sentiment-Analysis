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

// Define custom sentiment words for both English and Marathi
const positiveWords = ['happy', 'joyful', 'pleasant', 'good', 'great', 'awesome', 'आनंद', 'सुख', 'मस्त', 'अच्छा', 'उत्साह'];
const abusiveWordsEnglish = ['abuse', 'asshole', 'bastard', 'bitch', 'bullshit', 'cunt', 'dick', 'douchebag', 'fuck', 'motherfucker', 'piss', 'prick', 'shit', 'slut', 'whore', 'wanker', 'idiot', 'retard', 'stupid', 'jerk'];
const abusiveWordsMarathi = ['गंवार', 'चालवले', 'खोटारडं', 'नालायक', 'उत्सुकता', 'बदतमीज', 'विघ्न', 'निंदा', 'फटाक्याचे', 'रंगवले', 'कसाबात', 'असाधू', 'कुणी', 'घाणेरडा', 'कुटील', 'चुडेल', 'उत्सव', 'अस्मान', 'चिळी', 'मूर्ख', 'बावळट', 'शेमण्या'];
const negativeWords = ['sad', 'angry', 'upset', 'bad', 'horrible', 'terrible', , 'Worst', 'worst', 'दुख', 'खोटा', 'विघ्न', 'निराश', 'अस्वस्थ'];
const neutralWords = ['okay', 'fine', 'normal', 'neutral', 'satisfactory', 'साधारण', 'विवेकी', 'तटस्थ'];

const analyzeCustomSentiment = (text) => {
    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0, negativeCount = 0, neutralCount = 0, abusiveCount = 0;

    words.forEach((word) => {
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

    if (abusiveCount > 0) return 'Abusive';
    if (positiveCount > negativeCount) return 'Positive';
    if (negativeCount > positiveCount) return 'Negative';
    return 'Neutral';
};

const ChatFetcher = () => {
    const pdfRef = useRef();
    const [chats, setChats] = useState([]);
    const [sentimentResults, setSentimentResults] = useState([]);
    const { currentUser } = useContext(AuthContext);
    const { data } = useContext(ChatContext);
    const navigate = useNavigate();

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
            const sentiment = analyzeCustomSentiment(message.text);
            return { ...message, sentiment };
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
