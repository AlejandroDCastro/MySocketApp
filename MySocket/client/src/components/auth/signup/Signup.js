import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../../../UserContext';
import { Redirect, Link } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import NodeRSA from 'node-rsa';
import '../Authentication.css';
import loaderSpinner from '../assets/loader-spinner.png';


const Signup = () => {
    const { user, setUser } = useContext(UserContext);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const [loader, setLoader] = useState(null);


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

    const changeSubmitCSS = (option) => {

        // Set view for user experience
        let container = document.querySelector('#signup-view>div');

        if (option === 1) {
            container.classList.add('transparent');
            setLoader(<img src={loaderSpinner} alt='loading...' />);
        } else {
            container.classList.remove('transparent');
            setLoader(null);
        }
    }

    const submitHandler = async _ => {

        try {

            let data = undefined, privateKey = undefined, publicKey = undefined;
            if (password !== '') {

                // Apply hash function to password
                const wArray = CryptoJS.SHA3(password, { outputLength: 512 });
                const hash = wArray.toString(CryptoJS.enc.Base64);
                const klogin = hash.slice(0, hash.length / 2);
                const kdata = hash.slice(hash.length / 2, hash.length);

                // Create RSA key pair
                const key = new NodeRSA({ b: 2048 });
                publicKey = key.exportKey('public');
                privateKey = key.exportKey('private');
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
                })
                data = await res.json();
            } else {
                data = {
                    errors: {
                        name: '',
                        email: '',
                        password: 'A password is needed',
                    }
                }
            }

            if (data.errors) {
                changeSubmitCSS(2);
                if (data.errors.name === '') {
                    setNameError('');
                } else {
                    setNameError(<><i className="fas fa-exclamation-circle"></i><span>{data.errors.name}</span></>);
                }
                if (data.errors.email === '') {
                    setEmailError('');
                } else {
                    setEmailError(<><i className="fas fa-exclamation-circle"></i><span>{data.errors.email}</span></>);
                }
                if (data.errors.password === '') {
                    setPasswordError('');
                } else {
                    setPasswordError(<><i className="fas fa-exclamation-circle"></i><span>{data.errors.password}</span></>);
                }
            } else if (data.user_id) {

                // Save private key in browser hard disk
                localStorage.setItem('privateKey', privateKey);
                setUser({
                    _id: data.user_id,
                    name: name,
                    email: email,
                    publicKey: publicKey
                });

                // Set the current view for user
                sessionStorage.setItem('privateRoom', 'active');
                sessionStorage.setItem('sharedRoom', 'inactive');
            }
        } catch (error) {
            console.log(error);
        }
    }

    const submitSignup = e => {

        // Prevent the form submit action
        e.preventDefault();

        changeSubmitCSS(1);
        setTimeout(submitHandler, 350);
    }

    if (user) {
        return <Redirect to="/" />
    }


    return (
        <div id='signup-view' className="formData">
            <p>{loader}</p>
            <div>
                <div>
                    <h1>MySocket</h1>
                    <h2>Sign up</h2>
                    <p>Create a MySocket account</p>
                    <form onSubmit={submitSignup}>
                        <div className="inputData labelDown">
                            <input id="name" type="text" value={name} onChange={changeName} />
                            <label htmlFor="name">Enter a name</label>
                            <p className='error-msg'>{nameError}</p>
                        </div>
                        <div className="inputData labelDown">
                            <input id="email" type="email" value={email} onChange={changeEmail} />
                            <label htmlFor="email">Enter a email</label>
                            <p className='error-msg'>{emailError}</p>
                        </div>
                        <div className="inputData labelDown">
                            <input id="password" type="password" value={password} onChange={changePassword} />
                            <label htmlFor="password">Enter a password</label>
                            <p className='error-msg'>{passwordError}</p>
                        </div>
                        <p>You do not have an account yet? <Link to={'/login'}>Log In</Link></p>
                        <input className='button-effect' type="submit" value="Submit" />
                    </form>
                </div>
                <aside>
                    <p>
                        <i className="fas fa-comment"></i>
                        <i className="fas fa-comment"></i>
                    </p>
                    <p>Chat with family and friends safely. MySocket is your socket.</p>
                </aside>
            </div>
        </div>
    )
}

export default Signup;
