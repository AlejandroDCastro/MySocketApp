import React, { useState, useContext } from 'react';
import { UserContext } from '../../../UserContext';
import {Redirect} from 'react-router-dom';

const Signup = () => {
    const { user, setUser } = useContext(UserContext);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');


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
            const res = await fetch('http://localhost:5000/signup', {
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
        <div>
            <h2>Signup</h2>
            <form onSubmit={submitHandler}>
                <div>
                    <label htmlFor="name">Enter a name</label>
                    <input id="name" type="text" placeholder="Name" value={name} onChange={changeName} />
                    <p>{nameError}</p>
                </div>
                <div>
                    <label htmlFor="email">Enter a email</label>
                    <input id="email" type="email" placeholder="Email" value={email} onChange={changeEmail} />
                    <p>{emailError}</p>
                </div>
                <div>
                    <label htmlFor="password">Enter a password</label>
                    <input id="password" type="password" value={password} onChange={changePassword} />
                    <p>{passwordError}</p>
                </div>
                <div>
                    <input type="submit" value="Sign Up" />
                </div>
            </form>
        </div>
    )
}

export default Signup;
