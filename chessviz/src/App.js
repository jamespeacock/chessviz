import React from 'react';
import './App.css';
import WithMoveValidation from "./components/WithMoveValidation";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div style={boardsContainer}>
          <WithMoveValidation />
        </div>
      </header>
    </div>
  );
}

const boardsContainer = {
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  flexWrap: 'wrap',
  width: '100vw',
  marginTop: 30,
  marginBottom: 50
};

export default App;
