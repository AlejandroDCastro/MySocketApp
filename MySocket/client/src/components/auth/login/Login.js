import React, { useState, useContext } from 'react';
import { UserContext } from '../../../UserContext';
import { Redirect } from 'react-router-dom';

const Login = () => {
    const { user, setUser } = useContext(UserContext);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');


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
        <div>
            <h2>Login</h2>
            <form onSubmit={submitHandler}>
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
                    <input type="submit" value="Log In" />
                </div>
            </form>
        </div>
    )
}

export default Login;
