import React from 'react';
import './App.css';
import * as logic from "./apple_logic" ;
import {WormCanvas} from "./WormCanvas";
import {read_game, test_game} from "./apple_logic";

function App() {
  logic.test_apple()
  const gm = read_game(test_game)
  return (
    <div className="App">
      <WormCanvas gm={gm} mw={400} mh={200} />
    </div>
  );
}

export default App;
