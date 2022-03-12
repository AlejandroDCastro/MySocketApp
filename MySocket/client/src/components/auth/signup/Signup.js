import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../../../UserContext';
import { Redirect, Link } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import NodeRSA from 'node-rsa';
import '../Authentication.css';


const Signup = () => {
    const { user, setUser } = useContext(UserContext);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');


    // Hooks

    useEffect(() => {
        let inputDiv = document.querySelector('form>div:first-child');

        if (name !== '') {
            inputDiv.classList.replace('labelDown', 'labelUp');
        } else {
            inputDiv.classList.replace('labelUp', 'labelDown');
        }
    }, [name]);

    useEffect(() => {
        let inputDiv = document.querySelector('form>div:nth-child(2)');

        if (email !== '') {
            inputDiv.classList.replace('labelDown', 'labelUp');
        } else {
            inputDiv.classList.replace('labelUp', 'labelDown');
        }
    }, [email]);

    useEffect(() => {
        let inputDiv = document.querySelector('form>div:nth-child(3)');

        if (password !== '') {
            inputDiv.classList.replace('labelDown', 'labelUp');
        } else {
            inputDiv.classList.replace('labelUp', 'labelDown');
        }
    }, [password]);


    // Functions

    const changeName = e => {
        setName(e.target.value);
    }

    const changeEmail = e => {
        setEmail(e.target.value);
    }

    const changePassword = e => {
        setPassword(e.target.value);
    }

    const submitHandler = async e => {
        e.preventDefault();

        setEmailError('');
        setNameError('');
        setPasswordError('');

        console.log(name, email, password);
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

            // Create RSA key pair
            const key = new NodeRSA({ b: 2048 });
            const publicKey = key.exportKey('public');
            const privateKey = key.exportKey('private');
            let encryptedPrivateKey = CryptoJS.AES.encrypt(privateKey, kdata, CryptoJS.enc.Base64).toString();

            const res = await fetch('https://localhost:5000/signup', {
                method: 'POST',
                credentials: 'include', // include data to the browser
                body: JSON.stringify({
                    name,
                    email,
                    klogin,
                    publicKey,
                    encryptedPrivateKey
                }),
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            console.log(data);
            if (data.errors) {
                if (data.errors.email === '') {
                    setEmailError('');
                } else {
                    setEmailError(<><i class="fas fa-exclamation-circle"></i><span>{data.errors.email}</span></>);
                }
                if (data.errors.password === '') {
                    setPasswordError('');
                } else {
                    setPasswordError(<><i class="fas fa-exclamation-circle"></i><span>{data.errors.password}</span></>);
                }
                setEmailError(data.errors.email);
                setNameError(data.errors.name);
                setPasswordError(data.errors.password);
            } else if (data.user_id) {

                // Save private key in browser hard disk
                localStorage.setItem('privateKey', privateKey);
                console.log('Private Key saved!');
                setUser({
                    _id: data.user_id,
                    name: name,
                    email: email,
                    publicKey: publicKey
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
        <div id='signup-view' className="formData">
            <div>
                <div>
                    <h1>MySocket</h1>
                    <h2>Sign up</h2>
                    <p>Create a MySocket account</p>
                    <form onSubmit={submitHandler}>
                        <div className="inputData labelDown">
                            <input id="name" type="text" value={name} onChange={changeName} />
                            <label htmlFor="name">Enter a name</label>
                            <p>{nameError}</p>
                        </div>
                        <div className="inputData labelDown">
                            <input id="email" type="email" value={email} onChange={changeEmail} />
                            <label htmlFor="email">Enter a email</label>
                            <p>{emailError}</p>
                        </div>
                        <div className="inputData labelDown">
                            <input id="password" type="password" value={password} onChange={changePassword} />
                            <label htmlFor="password">Enter a password</label>
                            <p>{passwordError}</p>
                        </div>
                        <p>You do not have an account yet? <Link to={'/login'}>Log In</Link></p>
                        <input type="submit" value="Submit" />
                    </form>
                </div>
                <aside>
                    <p>
                        <i class="fas fa-comment"></i>
                        <i class="fas fa-comment"></i>
                    </p>
                    <p>Talk with family and friends. MySocket is your socket.</p>
                </aside>
            </div>
        </div>
    )
}

export default Signup;
