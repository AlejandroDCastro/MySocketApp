import React from 'react';

const Login = () => {
    return (
        <div>
            <h2>Login</h2>
            <form>
                <div>
                    <label htmlFor="email">Enter a email</label>
                    <input id="email" type="email" placeholder="Email" />
                </div>
                <div>
                    <label htmlFor="password">Enter a password</label>
                    <input id="password" type="password" />
                </div>
                <div>
                    <input type="submit" value="Sign Up" />
                </div>
            </form>
        </div>
    )
}

export default Login;
