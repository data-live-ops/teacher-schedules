import React from "react";
import { auth, googleProvider } from '../firebase-config';
import { signInWithPopup } from 'firebase/auth';
import '../App.css';

const Login = ({ onLoginSuccess }) => {
    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const userEmail = result.user.email;
            if (userEmail.endsWith('@colearn.id')) {
                onLoginSuccess(result.user);
            } else {
                throw new Error('Only users with @colearn.id email are allowed.');
            }
        } catch (e) {
            console.error(`Error during Google sign in: ${e.message}`)
            alert(e.message);
        }
    };

    return (
        <div className="login-container">
            <div>
                <img src="https://media.sessions.colearn.id/assets/other/images/2024-12-23T02:21:29.287Z-Clip path group-3.png" alt="man-seeing-screens" />
            </div>
            <div>
                <img src="https://media.sessions.colearn.id/assets/other/images/2024-12-23T06:28:13.735Z-Clip path group-4.png" alt="colearn-logo" />
                <h1>Welcome Back!</h1>
                <a className="login-button" onClick={handleGoogleLogin}>
                    <img src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png" alt="google-logo" />
                    <p>Login with your Google account</p>
                </a>
            </div>
        </div>
    )
}

export default Login;