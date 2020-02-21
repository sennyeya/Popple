import React from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import LandingPage from './student/LandingPage';
import TOS from './TOS';

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/tos">Terms of Service</Link>
            </li>
          </ul>
        </nav>

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/" exact render={(props)=><LandingPage {...props} id="5d5b5b04fc3bbe43c4d5fc65"/>}>
          </Route>
          <Route path="/tos" exact render={()=><TOS/>}>
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
