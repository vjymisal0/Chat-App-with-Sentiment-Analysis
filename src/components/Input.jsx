import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';

import {
    arrayUnion,
    doc,
    serverTimestamp,
    Timestamp,
    updateDoc,
    setDoc,
} from "firebase/firestore";

import { db, storage } from "../firebase";
import { v4 as uuid } from "uuid";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import Img from '../img/img.png';
import Attach from '../img/attach.png';

const Input = () => {
    const [text, setText] = useState("");
    const [img, setImg] = useState(null);

    const { currentUser } = useContext(AuthContext);
    const { data } = useContext(ChatContext);

    const handleSend = async () => {
        let imageUrl = null;

        if (img) {
            // Generate a unique reference for the image in Firebase Storage
            const storageRef = ref(storage, uuid());
            const uploadTask = uploadBytesResumable(storageRef, img);

            // Upload the image and get the download URL
            await new Promise((resolve, reject) => {
                uploadTask.on(
                    'state_changed',
                    null,
                    reject,
                    () => {
                        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                            imageUrl = downloadURL;
                            resolve();
                        });
                    }
                );
            });
        }

        // Create a message object
        const newMessage = {
            id: uuid(),
            text,
            senderId: currentUser.uid,
            date: Timestamp.now(),
            img: imageUrl || null,
        };

        // Update the chat document in "chats" collection
        await updateDoc(doc(db, "chats", data.chatId), {
            messages: arrayUnion(newMessage),
        });

        // Update the user's chat information in "userChats" collection
        await updateDoc(doc(db, "userChats", currentUser.uid), {
            [data.chatId + ".lastMessage"]: {
                text,
            },
            [data.chatId + ".date"]: serverTimestamp(),
        });

        await updateDoc(doc(db, "userChats", data.user.uid), {
            [data.chatId + ".lastMessage"]: {
                text,
            },
            [data.chatId + ".date"]: serverTimestamp(),
        });

        // Push the message to the "selfMessages" collection under the current user's ID
        const selfMessagesRef = doc(db, "selfMessages", currentUser.uid);
        await setDoc(selfMessagesRef, {
            messages: arrayUnion(newMessage)
        }, { merge: true });

        // Reset input fields
        setText("");
        setImg(null);
    };

    return (
        <div className="input">
            <input
                type="text"
                placeholder="Type something..."
                onChange={(e) => setText(e.target.value)}
                value={text}
            />
            <div className="send">
                <img src={Attach} alt="" />
                <input
                    type="file"
                    style={{ display: "none" }}
                    id="file"
                    onChange={(e) => setImg(e.target.files[0])}
                />
                <label htmlFor="file">
                    <img src={Img} alt="" />
                </label>
                <button onClick={handleSend}>Send</button>
            </div>
        </div>
    );
};

export default Input;