import React, { useState } from 'react'
import Add from "../img/addAvatar.png"
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth, storage } from '../firebase'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useNavigate, Link } from "react-router-dom";
import Swal from 'sweetalert2'


const Register = () => {
    const [err, setErr] = useState(false)
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();


    const handleSubmit = async (e) => {
        e.preventDefault()
        // console.log(e.target[0].value)
        const displayName = e.target[0].value
        const email = e.target[1].value
        const password = e.target[2].value
        const file = e.target[3].files[0]

        // sweetalert after success can be added here
        try {
            const res = await createUserWithEmailAndPassword(auth, email, password)

            const date = new Date().getTime();
            const storageRef = ref(storage, `${displayName + date}`);

            await uploadBytesResumable(storageRef, file).then(() => {
                getDownloadURL(storageRef).then(async (downloadURL) => {
                    try {
                        //Update profile
                        await updateProfile(res.user, {
                            displayName,
                            photoURL: downloadURL,
                        });
                        //create user on firestore
                        await setDoc(doc(db, "users", res.user.uid), {
                            uid: res.user.uid,
                            displayName,
                            email,
                            photoURL: downloadURL,
                        });



                        //create empty user chats on firestore
                        await setDoc(doc(db, "userChats", res.user.uid), {});
                        navigate("/login");
                    } catch (err) {
                        console.log(err);
                        setErr(true);
                        setLoading(false);
                    }

                });
            });
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Registered successfully',
                showConfirmButton: true,
                timer: 1500
            })

        } catch (err) {
            setErr(true);
            setLoading(false);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong!',
            })
        }
    };
    return (
        <div className="formContainer">
            <div className='formWrapper'>
                <span className="logo">Chat App</span>
                <span className="title">Register Yourself</span>
                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder='Name' />
                    <input type="email" placeholder='Email' />
                    <input type="password" placeholder='Password' />
                    <input style={{ display: "none" }} type="file" id='file' />
                    <label htmlFor="file"><img src={Add}
                        alt='Add Avatar'
                    />
                        <span>Upload Avatar</span>
                    </label>
                    <button disabled={loading}>Sign up</button>
                    {loading && "Uploading and compressing the image please wait..."}
                    {err && <span>Something went wrong!</span>}
                </form>
                <p>You do have an account? <Link to="/login">Login</Link> </p>

            </div>
        </div >
    )
}

export default Register