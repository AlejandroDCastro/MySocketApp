import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../../../UserContext';
import { Redirect } from 'react-router-dom';
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
            const res = await fetch('http://localhost:5000/login', {
                method: 'POST',
                credentials: 'include', // include data to the browser
                body: JSON.stringify({ email, password }),
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            console.log(data);
            if (data.errors) {
                setEmailError(data.errors.email);
                setPasswordError(data.errors.password);
            } else if (data.user) {
                setUser(data.user);
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
            <h2>Login</h2>
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
                <input type="submit" value="Log In" />
            </form>
        </div>
    )
}

export default Login;
