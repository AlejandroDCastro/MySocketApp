import './App.css';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import React, { useState } from 'react';
import { UserContext } from './UserContext';
import Chat from './components/chat/Chat';
import Home from './components/home/Home';
import Head from './components/layout/head/Head';

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <div className="App">

        {/* Accept in prop value the user connnected */}
        <UserContext.Provider value={{ user, setUser }}>
          <Head />
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/chat/:room_id/:room_name" component={Chat} />
          </Switch>
        </UserContext.Provider>
      </div>
    </Router>
  );
}

export default App;
