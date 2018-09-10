import React, { Component } from 'react';
import './App.css';
import Carousel from './Components/Carousel';

class App extends Component {
  render() {
    return (
      <div className="App">
        <p className="App-intro">
          Flickr Carousel
        </p>

        <Carousel />
      </div>
    );
  }
}

export default App;
