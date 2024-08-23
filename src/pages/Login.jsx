import { React, useState } from 'react'
import Add from "../img/addAvatar.png"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '../firebase'
import { Link, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2'


const Login = () => {
    const [err, setErr] = useState(false)
    // const [loading, setLoading] = useState(false);

    const navigate = useNavigate();


    const handleSubmit = async (e) => {
        e.preventDefault()
        // console.log(e.target[0].value)
        const email = e.target[0].value
        const password = e.target[1].value

        // sweetalert after success can be added here
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // console.log("logged in");
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Logged in successfully',
                showConfirmButton: true,
                timer: 1500
            })

            navigate("/");
        } catch (err) {
            setErr(true);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Email or password is incorrect!',

            })

            // setLoading(false);

        }
    };
    return (
        <div className="formContainer">
            <div className='formWrapper'>
                <span className="logo">Chat App</span>
                <span className="title">Login Yourself</span>
                <form onSubmit={handleSubmit}>

                    <input type="email" placeholder='Email' />
                    <input type="password" placeholder='Password' />

                    <button>Sign in</button>
                    {err && <span>Something went wrong!</span>}
                </form>

                <p>You don't have an account? <Link to="/register">Register</Link> </p>
            </div>
        </div >
    )
}

export default Login