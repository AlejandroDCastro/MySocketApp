import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../../../UserContext';
import { Redirect } from 'react-router-dom';
import CryptoJS from 'crypto-js';
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

            const res = await fetch('https://localhost:5000/signup', {
                method: 'POST',
                credentials: 'include', // include data to the browser
                body: JSON.stringify({
                    name,
                    email,
                    hash: {
                        klogin,
                        kdata
                    }
                }),
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            console.log(data);
            if (data.user) {

                // Decrypt to the initial UTF8 enconding key
                const privateKey = CryptoJS.AES.decrypt(data.user.encryptedPrivateKey, kdata).toString(CryptoJS.enc.Utf8);
                localStorage.setItem('privateKey', privateKey);
                setUser({
                    _id: data.user._id,
                    name: data.user.name,
                    email: data.user.email,
                    hash: {
                        klogin,
                        kdata
                    },
                    publicKey: data.user.publicKey
                });
            } else if (data.errors) {
                setEmailError(data.errors.email);
                setNameError(data.errors.name);
                setPasswordError(data.errors.password);
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
            <h2>Signup</h2>
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
                <input type="submit" value="Sign Up" />
            </form>
        </div>
    )
}

export default Signup;
