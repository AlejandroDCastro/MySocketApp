import React, { useState } from 'react';

const Signup = () => {
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
        console.log(name, email, password);
        try {
            const res = await fetch('http://localhost:5000/signup', {
                method: 'POST',
                body: JSON.stringify({ name, email, password }),
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            console.log(data);
        } catch (error) {
            console.log(error);
        }
    }


    return (
        <div>
            <h2>Signup</h2>
            <form onSubmit={submitHandler}>
                <div>
                    <label htmlFor="name">Enter a name</label>
                    <input id="name" type="text" placeholder="Name" value={name} onChange={changeName} />
                    <p></p>
                </div>
                <div>
                    <label htmlFor="email">Enter a email</label>
                    <input id="email" type="email" placeholder="Email" value={email} onChange={changeEmail} />
                    <p></p>
                </div>
                <div>
                    <label htmlFor="password">Enter a password</label>
                    <input id="password" type="password" value={password} onChange={changePassword} />
                    <p></p>
                </div>
                <div>
                    <input type="submit" value="Sign Up" />
                </div>
            </form>
        </div>
    )
}

export default Signup;
