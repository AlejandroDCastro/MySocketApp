import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../../../UserContext';
import { Redirect, Link } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import '../Authentication.css';

const Login = () => {
    const { user, setUser } = useContext(UserContext);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');


    // Hooks

    useEffect(() => {
        let inputDiv = document.querySelector('form>div:first-child');
        
        if (email !== '') {
            inputDiv.classList.replace('labelDown', 'labelUp');
        } else {
            inputDiv.classList.replace('labelUp', 'labelDown');
        }
    }, [email])

    useEffect(() => {
        let inputDiv = document.querySelector('form>div:nth-child(2)');
        
        if (password !== '') {
            inputDiv.classList.replace('labelDown', 'labelUp');
        } else {
            inputDiv.classList.replace('labelUp', 'labelDown');
        }
    }, [password])



    // Functions

    const changeEmail = e => {
        setEmail(e.target.value);
    }

    const changePassword = e => {
        setPassword(e.target.value);
    }

    const submitHandler = async e => {
        e.preventDefault();
        setEmailError('');
        setPasswordError('');

        console.log(email, password);
        try {

            // Apply hash function to password
            const wArray = CryptoJS.SHA3(password, { outputLength: 512 });
            console.log('WordArray:', wArray);
            const hash = wArray.toString(CryptoJS.enc.Base64);
            console.log('Hash:', hash);
            const klogin = hash.slice(0, hash.length / 2);
            const kdata = hash.slice(hash.length / 2, hash.length);
            console.log('klogin:', klogin);
            console.log('kdata:', kdata);

            const res = await fetch('https://localhost:5000/login', {
                method: 'POST',
                credentials: 'include', // include data to the browser
                body: JSON.stringify({
                    email,
                    klogin
                }),
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            console.log(data);
            if (data.errors) {
                setEmailError(data.errors.email);
                setPasswordError(data.errors.password);
            } else if (data.user) {

                // Decrypt to the initial UTF-8 enconding key
                const privateKey = CryptoJS.AES.decrypt(data.user.encryptedPrivateKey, kdata).toString(CryptoJS.enc.Utf8);
                localStorage.setItem('privateKey', privateKey);
                console.log('Private Key saved!');
                setUser({
                    _id: data.user._id,
                    name: data.user.name,
                    email: data.user.email,
                    publicKey: data.user.publicKey
                });
            }
        } catch (error) {
            console.log(error);
        }
    }


    if (user) {
        return <Redirect to="/" />
    }


    return (
        <div className="formData formView">
            <div>
                <h2>Log In</h2>
                <p>Use your MySocket account</p>
                <form onSubmit={submitHandler}>
                    <div className="inputData labelDown">
                        <input id="email" type="email" value={email} onChange={changeEmail} />
                        <label htmlFor="email">Enter an email</label>
                        <p>{emailError}</p>
                    </div>
                    <div className="inputData labelDown">
                        <input id="password" type="password" value={password} onChange={changePassword} />
                        <label htmlFor="password">Enter a password</label>
                        <p>{passwordError}</p>
                    </div>
                    <p>Do you already have an account? <Link to={'/signup'}>Sign Up</Link></p>
                    <input type="submit" value="Submit" />
                </form>
            </div>
        </div>
    )
}

export default Login;
