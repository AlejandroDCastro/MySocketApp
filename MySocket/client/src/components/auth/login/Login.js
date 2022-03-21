import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../../../UserContext';
import { Redirect, Link } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import '../Authentication.css';
import loaderSpinner from '../assets/loader-spinner.png';


const Login = () => {
    const { user, setUser } = useContext(UserContext);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const [loader, setLoader] = useState(null);


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

    const changeSubmitCSS = (option) => {

        // Set view for user experience
        let container = document.querySelector('#login-view>div');

        if (option === 1) {
            container.classList.add('transparent');
            setLoader(<img src={loaderSpinner} alt='loading...' />);
        } else {
            container.classList.remove('transparent');
            setLoader(null);
        }
    }

    const submitHandler = async _ => {

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
                changeSubmitCSS(2);
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
                
                // Set the current view for user
                sessionStorage.setItem('privateRoom', 'active');
                sessionStorage.setItem('sharedRoom', 'inactive');
            }
        } catch (error) {
            console.log(error);
        }
    }

    const submitLogin = e => {

        // Prevent the form submit action
        e.preventDefault();

        changeSubmitCSS(1);
        setTimeout(submitHandler, 350);
    }


    if (user) {
        return <Redirect to="/" />
    }


    return (
        <div id='login-view' className="formData">
            <p>{loader}</p>
            <div>
                <div>
                    <h1>MySocket</h1>
                    <h2>Log in</h2>
                    <p>Use your MySocket account</p>
                    <form onSubmit={submitLogin}>
                        <div className="inputData labelDown">
                            <input id="email" type="email" value={email} onChange={changeEmail} />
                            <label htmlFor="email">Enter an email</label>
                            <p className='error-msg'>{emailError}</p>
                        </div>
                        <div className="inputData labelDown">
                            <input id="password" type="password" value={password} onChange={changePassword} />
                            <label htmlFor="password">Enter a password</label>
                            <p className='error-msg'>{passwordError}</p>
                        </div>
                        <p>Do you already have an account? <Link to={'/signup'}>Sign Up</Link></p>
                        <input className='button-effect' type="submit" value="Submit" />
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login;
