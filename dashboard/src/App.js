import React, { useState, Component,useEffect } from 'react';
import AddPurchase from "./AddPurchase.js";
import Dashboard from "./Dashboard.js";
import { user1, Purchase, Account } from './store.js';
import {BrowserRouter as Router, Route, Link,withRouter } from "react-router-dom";
import { startOfWeek, format, addDays, getTime, parseJSON } from 'date-fns'
import { loadUser, updateUser, addPurchase } from './Backend.js'
import {LineChart,BarChart} from './Chart.js';
import HomePage from "./components/HomePage/index.js";
import Login from "./components/Login/index.js";
import Register from "./components/Register/index.js";
import Dashboard1 from "./components/Dashboard/index.js";
import firebase from "./components/firebase.js";



function App(props) {
    const [account, setAccount] = useState(user1);
    const [firebaseInitialized, setFirebaseInitialized] = useState(false)

	useEffect(() => {
        console.log("trying to initialize")
		firebase.isInitialized().then(val => {
			setFirebaseInitialized(val)
		})
	})
    const alterBudget = (account) => {
        if (document.getElementById("alter-budget-input") !== null) {
            console.log(document.getElementById("alter-budget-input").value);
            account.weeklyBudget = document.getElementById("alter-budget-input").value;
            handleChange(account);
        }

    }



    const handleChange = (newAccount) => {
        const accountCopy = Object.assign(Object.create(Object.getPrototypeOf(newAccount)), newAccount);
        console.log(accountCopy);
        setAccount(accountCopy);
    }
    return (
        <div className="App">
            <Router>
                <Route exact path="/dashboard" render={(props) => <Dashboard account={account} handleChange={handleChange} alterBudget={alterBudget} />} />
                <Route exact path="/" render={(props) => <HomePage/>} />
                <Route exact path="/login" render={(props) => <Login/>} />
                <Route exact path="/register" render={(props) => <Register/>} />
                <Route exact path="/purchase" render={(props) => <AddPurchase account={account} handleChange={handleChange}/>} />
            </Router>


        </div>
    )
}
export default withRouter(App);