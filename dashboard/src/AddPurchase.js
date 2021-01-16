import React, { Component } from "react";
import {addPurchase, loadUser} from  "./Backend.js";
import "./AddPurchase.css";
import {Purchase} from "./store.js";
import { startOfWeek, format, addDays, getTime, parseJSON, parseISO } from 'date-fns';
import firebase from './components/firebase.js'
import { withRouter } from "react-router-dom";




const formValid = ({ formErrors, ...rest }) => {
  let valid = true;



  return valid;
};

const dayToDate = (day) => {
  for (let i = 0; i < 7; i++) {
    if (format(addDays(startOfWeek(new Date),i),"EEEEEE") == day) {
      return format(addDays(startOfWeek(new Date),i),"yyyy-MM-dd")
    }
  }
}

const processRepetitions = (item) => {
  if (item.repetition !== "No") {
    console.log(parseISO(item.date));
    console.log(addDays(parseISO(item.date),365));
    return format(addDays(parseISO(item.date),365),"yyyy-MM-dd");
  }
  return item.date;
}

class AddPurchase extends Component {
  constructor(props) {
    super(props);

    this.state = {
      account: null,
      itemName: null,
      price: null,
      category: null,
      day: null,
      repeat: null,
      formErrors: {
        itemName: "",
        price: "",
        category: "",
        day: "",
        repeat: ""
      }
    };
  }

  componentDidMount() {
    console.log("Mounted");
    console.log(this.props)

  }

  handleSubmit = e => {
    e.preventDefault();

    if (formValid(this.state)) {
      const newPurchase = {
        name: this.state.itemName,
        price: this.state.price,
        category: this.state.category,
        date: dayToDate(this.state.day),
        repetition: this.state.repeat,
        uuid: this.props.account.uuid
      }
      debugger;

      //change to a dictionary, not object
      console.log(newPurchase);
      newPurchase.date = processRepetitions(newPurchase);
      addPurchase(newPurchase,this.props.account,this.props.handleChange);
      console.log(`
        --SUBMITTING--
        Item Name: ${this.state.itemName}
        Price: ${this.state.price}
        Category: ${this.state.category}
        Date: ${this.state.day}
        repeat: ${this.state.repeat}
        uuid: ${this.props.account.uuid}
      `);
    } else {
      console.error("FORM INVALID - DISPLAY ERROR MESSAGE");
    }
  };

  handleChange1 = e => {
    e.preventDefault();
    const { name, value } = e.target;
    let formErrors = { ...this.state.formErrors };

    this.setState({ formErrors, [name]: value }, () => console.log(this.state));
  };

  render() {
    const { formErrors } = this.state;

    return (
      <div className="wrapper1">
        <div className="form-wrapper">
          <h1>Create New Purchase</h1>
          <form onSubmit={this.handleSubmit}>
            <div className="itemName">
              <label htmlFor="itemName">Item Name</label>
              <input
                className={formErrors.itemName.length > 0 ? "error" : null}
                placeholder="Item Name"
                type="text"
                name="itemName"
                noValidate
                onChange={this.handleChange1}
              />

            </div>

            <div className="price">
              <label htmlFor="price">Price</label>
              <input
                placeholder="Enter Number"
                type="text"
                name="price"
                noValidate
                onChange={this.handleChange1}
              />

            </div>

            <div className="day">
              <label htmlFor="day">Date Purchased</label>
              <select id="day" name="day"
              noValidate
              onChange={this.handleChange1}>
                <option value="selectDate">Select Date </option>
                <option value="Su">Sunday</option>
                <option value="Mo">Monday</option>
                <option value="Tu">Tuesday</option>
                <option value="We">Wednesday</option>
                <option value="Th">Thursday</option>
                <option value="Fr">Friday</option>
                <option value="Sa">Saturday</option>
              </select>

            </div>

            <div className="category">
              <label htmlFor="category">Category</label>
              <select id="category" name="category"
              noValidate
              onChange={this.handleChange1}>
                <option value="selectCategory">Select Category</option>
                <option value="Groceries">Groceries</option>
                <option value="Rent">Rent</option>
                <option value="Memberships">Memberships</option>
                <option value="Travel">Travel</option>
                <option value="Transportation Expenses">Transportation Expenses</option>
                <option value="Clothes">Clothes</option>
                <option value="Entertainment">Entertainment</option>
              </select>
            </div>

            <div className="repeat">
              <label htmlFor="repeat">Repeat Purchase</label>
              <input
                placeholder="Repeat Purchase"
                type="text"
                name="repeat"
                noValidate
                onChange={this.handleChange1}
              />
            </div>

            <div className="createPurchase">
              <button type="submit" >Add Purchase</button>
              {/* <button onClick={(e) => {
              e.preventDefault();
              window.location.href='/dashboard';
              }}>Exit Page</button> */}
              <button onClick={() => {
                this.props.history.push({
                  pathname: "/dashboard",
                  state: {
                    account: this.props.account
                  }
                })
               }}>Exit Page</button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default withRouter(AddPurchase);