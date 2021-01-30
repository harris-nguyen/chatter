import './App.css';
import React, { Component } from "react";
import Routes from './Routes'

class App extends Component {
  componentDidMount(){
    fetch("/health-check")
    .then((response) => response.json())
    .then((data) => console.log(data));
  }
  render(){
    return (
      <div className="App">
        <header>
          Hello
        </header>
        <Routes />
      </div>
    )
  }
}

export default App;
