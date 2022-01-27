import './App.css';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { UserContext } from './UserContext';
import Chat from './components/chat/Chat';
import Home from './components/home/Home';
import Head from './components/layout/head/Head';
import Login from './components/auth/login/Login';
import Signup from './components/auth/signup/Signup';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const verifyuser = async () => {
      try {
        const res = await fetch('http://localhost:5000/verifyuser', {
          credentials: 'include', // include data to the browser
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        setUser(data);
      } catch (error) {
        console.log(error);
      }
    }
    verifyuser();
  }, [])

  return (
    <Router>
      <div className="App">

        {/* Accept in prop value the user connnected */}
        <UserContext.Provider value={{ user, setUser }}>
          <Head />
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/chat/:privacy/:room_id/:room_name" component={Chat} />
            <Route path="/signup" component={Signup} />
            <Route path="/login" component={Login} />
          </Switch>
        </UserContext.Provider>
      </div>
    </Router>
  );
}

export default App;
