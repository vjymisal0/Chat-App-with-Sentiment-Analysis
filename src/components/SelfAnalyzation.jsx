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

// Define custom sentiment words for both English and Marathi
const positiveWords = [
    'happy', 'joyful', 'pleasant', 'good', 'great', 'awesome', 'nice', 'wow', 'thanks', 'best', 'better', 'super',
    'fantastic', 'amazing', 'brilliant', 'cool', 'excellent', 'wonderful', 'fabulous', 'splendid', 'loved', 'perfect',
    'beautiful', 'grateful', 'exciting', 'lovely', 'adorable', 'charming', 'creative', 'blessed', 'successful', 'lucky',
    'cheerful', 'incredible', 'supportive', 'positive', 'delightful', 'motivated', 'sweet', 'optimistic', 'winner',
    'calm', 'appreciated', 'fulfilled', 'admirable', 'helpful', 'thrilled', 'enthusiastic', 'smooth', 'confident',
    'proud', 'vibrant', 'joyous', 'fun', 'thriving', 'glad', 'elated', 'graceful', 'hopeful', 'prosperous', 'सुख', 'आनंद',
    'मस्त', 'अच्छा', 'उत्साह', 'आदर', 'शांत', 'सकारात्मक', 'अति उत्तम', 'आशावादी', 'माझं', 'शुभ्र', 'चमत्कारिक',
    'भरभराट', 'उत्तेजित', 'प्रसन्न', 'उमेद', 'शानदार', 'धन्य', 'कौतुक', 'संपन्न', 'चैतन्य', 'आभारी', 'प्रिय', 'सुखकर',
    'विश्रांती', 'आरामदायी', 'नवीन', 'प्रसिद्ध', 'स्वतंत्र', 'उत्तम', 'उत्तमदायक', 'खुशी', 'सर्वोत्कृष्ट', 'गौरवशाली',
    'समृद्ध', 'आकर्षक', 'बरोबर', 'खुश', 'चांगले', 'सहज', 'दिलीप', 'मोहक', 'मिलनसार', 'विघ्न', 'शांतता', 'सोपे', 'सिद्ध',
    'उत्साही', 'हसरा', 'मान्य', 'संतोष', 'गौरव', 'बाप', 'असामान्य', 'दृढनिश्चयी', 'कष्टाळू', 'सर्जनशील', 'समजूतदार',
    'आश्चर्यकारक', 'तल्लख', 'तृप्त', 'उत्कृष्ट'
];

const abusiveWordsEnglish = [
    'abuse', 'asshole', 'bastard', 'bitch', 'bullshit', 'cunt', 'dick', 'douchebag', 'fuck', 'motherfucker', 'piss',
    'prick', 'shit', 'slut', 'whore', 'wanker', 'idiot', 'retard', 'stupid', 'jerk', 'crap', 'damn', 'loser', 'scumbag',
    'dumb', 'moron', 'screw', 'trash', 'suck', 'bugger', 'fool', 'douche', 'twat', 'jerkoff', 'blowjob', 'freak', 'sucker',
    'jackass', 'pussy', 'butt', 'puke', 'bitchy', 'bimbo', 'smack', 'ass', 'arse', 'numbskull', 'dipshit', 'hell', 'bloody',
    'idiotic', 'numpty', 'tool', 'crappy', 'wussy', 'dunce', 'bastards', 'retarded', 'backstabber', 'chicken', 'nuts',
    'cranky', 'sonofabitch', 'dipstick', 'kink', 'joke', 'hag', 'arsehole', 'drunk', 'perv', 'tosser', 'misfit', 'flop',
    'jerkass', 'punk', 'weirdo', 'scum', 'sleezy', 'broke', 'creep', 'rude', 'shithead', 'git', 'weirdo', 'asswipe',
    'scummy', 'coward', 'dumbass', 'dog', 'buffoon', 'cocky', 'creep', 'sap', 'crybaby', 'imbecile', 'fucked', 'dipshit',
    'maggot', 'maniac', 'deranged', 'twisted', 'clown', 'annoying', 'hellish', 'ugly', 'bother', 'gross', 'nerd', 'assclown',
    'wimp', 'bloated', 'hack', 'lazy', 'idiocy', 'coward', 'baboon', 'gibberish'
];

const abusiveWordsMarathi = [
    'गंवार', 'चालवले', 'खोटारडं', 'नालायक', 'उत्सुकता', 'बदतमीज', 'विघ्न', 'निंदा', 'फटाक्याचे', 'रंगवले', 'कसाबात',
    'असाधू', 'कुणी', 'घाणेरडा', 'कुटील', 'चुडेल', 'उत्सव', 'अस्मान', 'चिळी', 'मूर्ख', 'बावळट', 'शेमण्या', 'नशिबाचा',
    'फारकत', 'निघ', 'आलसी', 'मदत', 'ढेकर', 'आडमुठा', 'फेक', 'भेकड', 'वेड', 'भिकार', 'भरकटलेला', 'बेजबाबदार', 'शैतान',
    'कावळा', 'ढोंगी', 'काळ', 'भूत', 'घमंडी', 'कसब', 'नालायक', 'वेढला', 'खरं', 'फेक', 'घाण', 'द्रोह', 'विसरलेला',
    'कातडी', 'विकृत', 'सडके', 'भ्रष्ट', 'खेकडा', 'निंदा', 'अपमान', 'कळत नाही', 'घडलेला', 'विक्रेत', 'फसवणूक', 'शक्यतो',
    'बेशरम', 'हट्ट', 'शून्य', 'चाळू', 'नालायक', 'बेभरवसा', 'तोंडफाटका', 'कट्टर', 'बखाणा', 'भिंत', 'विमल', 'वाचाळ', 'फुस',
    'वाघराणे', 'निराश', 'चिपकू', 'काही', 'मूर्खपणा', 'धडपड', 'भरकटलेला', 'खोटं', 'असंबद्ध', 'हाणामारी', 'झिंगलेला',
    'मुद्दाम', 'गप्प', 'फालतू', 'भिकारचोट', 'कमी', 'राक्षस', 'मजेत', 'थडगा', 'नालायक', 'नाही', 'कट्टर', 'वैतागलेला',
    'चेष्टा', 'बेजबाबदार'
];
const negativeWords = [
    'दुःख', 'निराश', 'अस्वस्थ', 'खोटा', 'विघ्न', 'कायम', 'भयानक', 'दुख', 'आशा नाही', 'संकट', 'त्रास', 'बिचारा',
    'वेदनादायक', 'फसवलेला', 'रुसलेला', 'हाहाकार', 'पराभूत', 'निराशाजनक', 'भ्रष्ट', 'धोकादायक', 'नासलेले', 'रडणे',
    'एकटा', 'दोषी', 'दुर्दैवी', 'बेकार', 'भयावह', 'सतावलेले', 'कसोटी', 'माणूसघाण', 'काळजी', 'घाबरलेला', 'ह्रास',
    'अनिच्छुक', 'चुका', 'सदोष', 'रडका', 'कष्टकरी', 'उपस', 'शून्य', 'नकळत', 'कडवट', 'कुंठा', 'भीती', 'चर्चा', 'अप्रिय',
    'अविवेकी', 'उध्वस्त', 'संशय', 'गुन्हा', 'हिंसा', 'झगडा', 'फसवणूक', 'कटू', 'दु:ख', 'खेद', 'कडक', 'अमानवीय',
    'संपूर्ण', 'त्रस्त', 'झकास', 'धूर्त', 'परेशानी', 'चीड', 'न्यायबुद्धी', 'रस्त्यावर', 'फाटलेला', 'विघातक', 'अजाणता',
    'दहशत', 'उध्वस्त', 'थकवा', 'नशिब', 'दोष', 'तक्रार', 'तणाव', 'अधिकारशून्य', 'काळजीत', 'डरपोक', 'विस्कटलेले', 'फालतू',
    'भंगार', 'बेचैन', 'नैराश्य', 'दुष्ट', 'क्रूर', 'शिकवलेले', 'जाळ', 'अकारण', 'अराजक', 'रोजच', 'गुंड', 'नियंत्रित', 'पोकळ',
    'तलफ', 'घुसमट', 'विफल', 'शहाणपण', 'सुधारणा', 'बेचेन', 'कटू', 'समाप्त', 'बेकार', 'दुष्ट', 'फायदेशीर नाही', 'विनाशकारी',
    'दुःख', 'खोटं', 'भयानक', 'निंदक', 'फसवणूक', 'बेरंग', 'व्यर्थ', 'थकवलेला', 'संपूर्ण', 'धाडस', 'शांत', 'सदोष', 'रडीचा',
    'कट्टर', 'आव्हानात्मक', 'दुःखकारक', 'मानसिकतेचा', 'निराशा', 'अभाव', 'त्रास', 'क्रूरता', 'वेडेपणा', 'चुकीचे'
];

const neutralWords = [
    'okay', 'fine', 'normal', 'neutral', 'satisfactory', 'average', 'usual', 'so-so', 'alright', 'decent', 'fair',
    'mediocre', 'balanced', 'regular', 'expected', 'ordinary', 'middle', 'steady', 'moderate', 'standard', 'unremarkable',
    'acceptable', 'calm', 'stable', 'expected', 'mild', 'even', 'consistent', 'typical', 'routine', 'familiar', 'reliable',
    'plain', 'undecided', 'indifferent', 'tolerable', 'sufficient', 'manageable', 'appropriate', 'resilient', 'not bad',
    'fine enough', 'so-so', 'nothing special', 'controlled', 'level-headed', 'unbiased', 'sensible', 'reserved', 'practical',
    'तटस्थ', 'साधारण', 'विवेकी', 'नैसर्गिक', 'ठीक', 'नॉर्मल', 'मध्यम', 'अविचलित', 'सर्वसाधारण', 'निवांत', 'अर्थपूर्ण',
    'सध्या', 'स्थिर', 'संतुलित', 'नियमित', 'मध्यमार्गी', 'अर्थपूर्ण', 'व्यवस्थित', 'सरळ', 'समजूतदार', 'तटस्थ', 'साधारण',
    'संसाधनशील', 'मध्यम', 'मुळात', 'तटस्थ', 'सुरक्षित', 'सुसंगत', 'असहमत', 'मिळमिळीत', 'अर्धवट', 'स्वभावत', 'विनाकारण',
    'अखंड', 'वाट्याचे', 'आमचे', 'उत्सुक', 'निश्चित', 'मुल्यांकन', 'अविचारी', 'अर्धा', 'सामान्य', 'सर्वांगीण', 'सुसंगत',
    'अविचलित', 'अर्थपूर्ण', 'प्रतिकूल', 'नियोजन', 'दिशाहीन', 'मध्यमार्गी', 'विवेकशून्य', 'स्थिर', 'तटस्थ', 'समर्पक',
    'विश्रांतीचा', 'नेहमीचा', 'अर्थपूर्ण', 'सरासरी', 'आत्मनिरीक्षण', 'बाजूचा', 'साधे', 'सामान्य', 'मागील', 'किंचित'
];


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

const SelfAnalyzation = () => {
    const [userMessages, setUserMessages] = useState([]);
    const [sentimentResults, setSentimentResults] = useState([]);
    const { currentUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const pdfRef = useRef();

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
            const sentiment = analyzeCustomSentiment(message.text || '');
            return {
                ...message,
                sentiment,
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
