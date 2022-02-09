import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../../../UserContext';
import { Redirect } from 'react-router-dom';
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
            const res = await fetch('https://localhost:5000/signup', {
                method: 'POST',
                credentials: 'include', // include data to the browser
                body: JSON.stringify({ name, email, password }),
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            console.log(data);
            if (data.errors) {
                setEmailError(data.errors.email);
                setNameError(data.errors.name);
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
