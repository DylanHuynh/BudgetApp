import logo from './logo.svg';
import './Dashboard.css';
import React, { useState, Component,useEffect } from 'react';
import { DayPilot, DayPilotCalendar } from "daypilot-pro-react";
import ProgressBar from './ProgressBar.js';
import Calendar from './Calendar.js';
import {LineChart,BarChart} from './Chart.js';
import 'typeface-roboto'
import './Figma.css';
import { requirePropFactory } from '@material-ui/core';
import { user1, Purchase, Account } from './store.js';
import { startOfWeek, format, addDays, getTime, parseJSON } from 'date-fns'
import { loadUser, updateUser, addPurchase } from './Backend.js'
import {Route, Link, useHistory} from "react-router-dom";
import AddPurchase from "./AddPurchase.js";
import firebase from './components/firebase.js'
import { withRouter } from "react-router";


//going to previous and next = add/subtract 7 days
//add currentFirstDay which use to determine what to render in that week
//only class should be purchase, day should be converted into a Date object
//checkboxes for each repetition day so attribute is an array not a string
//getDay returns 0-6 corresponding to M-S
//isEqual() compares date objects


// let formattedFirstDay = format(firstDay,' EEEEEE M/d');
// console.log(formattedFirstDay);
const findPurchaseTotal = (account, startOfWeek) => {
  let sum = 0;
  for (const purchase of account.purchases) {
    if (purchase.repetition.length > 0) {
      sum += purchase.repetition.length * purchase.price;
    }
    else if (getTime(purchase.day) >= getTime(startOfWeek) && getTime(purchase.day) < getTime(addDays(startOfWeek, 7)))
      sum += purchase.price;

  }
  return sum;
}

const findPriceDistribution = (account, startOfWeek) => {
  let prices = {};
  let pricesArr = [];
  for (const purchase of account.purchases) {
    if (purchase.repetition.length > 0) {
      if (purchase.category in prices) {
        prices[purchase.category] += purchase.price*purchase.repetition.length;

      }
      else {
        prices[purchase.category] = purchase.price*purchase.repetition.length;

      }
    }
    else if (getTime(purchase.day) >= getTime(startOfWeek) && getTime(purchase.day) < getTime(addDays(startOfWeek, 7))){
      //console.log(purchase.name)
      if (purchase.category in prices) {
        prices[purchase.category] += purchase.price;
      }
      else {
        prices[purchase.category] = purchase.price;

      }
    }


  }
  for (const key in Object.keys(prices)) {
    pricesArr.push(prices[Object.keys(prices)[key]])
  }
  return [pricesArr,Object.keys(prices)];
}

const generateDailyCosts = (account, startOfWeek) => {
  let cumulativeCost = 0;
  let budget = account.weeklyBudget;
  let days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  let dailyCosts = [budget, budget, budget, budget, budget, budget, budget];
  for (let i = 0; i < 7; i++) {
    for (const purchase of account.purchases) {
      if (purchase.repetition.includes(days[i])) {
        cumulativeCost += purchase.price;
      }
      else if (format(purchase.day, 'EEEEEE') === days[i] && (getTime(purchase.day) >= getTime(startOfWeek) && getTime(purchase.day) < getTime(addDays(startOfWeek, 7)))) {
        cumulativeCost += purchase.price;
      }

    }
    dailyCosts[i] -= cumulativeCost;
  }
  return dailyCosts
}

const statusMessage = (account, budget, categoryPrices, startOfWeek) => {
  console.log(categoryPrices);
  if (findPurchaseTotal(account, startOfWeek) > 0 && findPurchaseTotal(account, startOfWeek) <= budget) {
    return ["On Track!", "Keep it up!"]
  }
  else {
    let maxCategory = "";
    let maxPrice = 0;
    debugger;
    for (let i = 0; i < categoryPrices[0].length; i++) {
      console.log(categoryPrices[0][i]);
      if (categoryPrices[0][i] > maxPrice) {
        maxCategory = categoryPrices[1][i];
        maxPrice = categoryPrices[0][i];
      }
    }
    if (maxCategory === "") {
      return ["N/A", "Make some purchases!"];
    }
    return ["Warning", " Consider reducing spending in " + maxCategory];
  }
}




// edit these values after filling in the forms in the Add Purchase page.
let name = "Chipotle";
let price = 11;
let category = "Food";
let date = "2022-12-30";
let repetition = "Th";
let uuid = "0";
let examplePurchase = {name: `${name}`, price: `${price}`, category: `${category}`, date: `${date}`, repetition: `${repetition}`, uuid: `${uuid}`};


function Dashboard(props) {

  let history = useHistory();

  const [firstDay, setDate] = useState(startOfWeek(new Date()));
  const alterDate = (count) => {
    setDate(addDays(firstDay, count));
    console.log(addDays(firstDay, count))
  }

  const visualizationDict = {
    one: <LineChart dailyCosts={generateDailyCosts(props.account, firstDay)} />,
    two: <BarChart dailyCosts={findPriceDistribution(props.account,firstDay)[0]} categoryLabels={findPriceDistribution(props.account,firstDay)[1]} />
  }
  const vals = findPriceDistribution(props.account, firstDay);
  const [visualization,setVisualization] = useState(["one","two"])
  //create a copy, splice copy,set original visualization to copy
  //find computer ip address, disable firewall for that port (verify 3306 is right and open)
  const toggleVisualization = () => {

    const firstElem = visualization[0]
    visualization.splice(0,1);
    console.log(visualization);
    const megaClone = visualization.concat([firstElem]);
    console.log(megaClone);
    console.log( Object.assign(megaClone));
    setVisualization( Object.assign(megaClone));

  }
  const [quote, setQuote] = useState('')

  const handleClickPurchase = () => {
    history.push({
      pathname:"/purchase",
      state: props.account
    });
  }

  useEffect(() => {
    console.log("first load");
    console.log(props);
    console.log(firebase);

    debugger;
    console.log(firebase.getUserID());
    //loadUser('abcde', props.handleChange);
    //updateUser(props.account,props.handleChange);
		if(firebase.getCurrentUsername()) {
      firebase.getCurrentUserQuote().then(setQuote)
      loadUser(firebase.getUserID(),props.handleChange)
		}


	  }, [])
  return (

    <div>

      <div id="frame"><span id="dashboard-title">My Dashboard</span>
        <div id="next-box"></div>
        <span onClick={() => alterDate(-7)} id="previous">Previous</span>
        <div id="previous-box"></div>
        <span onClick={() => alterDate(7)} id="next">Next</span>

        <Calendar onChange ={props.handleChange} startDate={firstDay} account={props.account}/>
        {/* TODO: grid layout from MDN guide for columns */}


        <div id="report-header-box"></div>
        <div id="visualization-header-box"></div>
        <span id="report-header">Status Report: {statusMessage(props.account, props.account.weeklyBudget, vals, firstDay)[0]}</span>
        <span onClick={() => toggleVisualization()} id="visualization-header">Click Here to Toggle!</span>
        <div id="report"></div>
        <div id="visualization">
          {visualizationDict[visualization[0]]}
        </div>
        <ProgressBar percentage={(findPurchaseTotal(props.account, firstDay) / props.account.weeklyBudget * 100)>99 ? 100 : (findPurchaseTotal(props.account, firstDay) / props.account.weeklyBudget * 100)} />



        <span id="e2_91">You’re projected to spend {Math.round(findPurchaseTotal(props.account, firstDay) / props.account.weeklyBudget * 100)}% of your weekly budget</span>
        <span id="recommendation">Recommendation: {statusMessage(props.account, props.account.weeklyBudget, vals, firstDay)[1]}
        </span>
        <span id="total-spending">Your current budget is ${props.account.weeklyBudget} and current total spending is ${findPurchaseTotal(props.account, firstDay)}</span>


        <div id="add-purchase" onClick={() => handleClickPurchase()}>  Add Purchase</div>
        <div id="sign-out" onClick={logout}> Sign Out</div>
        <input id ="alter-budget-input" type="text" name="budget" />
          <button id="alter-budget"   onClick={() => props.alterBudget(props.account)}>Alter Budget</button>


      </div>
    </div>
  );
  async function logout() {
		await firebase.logout()
		props.history.replace('/')
	}
}

export default withRouter(Dashboard);
