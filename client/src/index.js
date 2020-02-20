import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import LandingPage from './student/LandingPage';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<LandingPage id={"5d5b5b04fc3bbe43c4d5fc65"}/>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
