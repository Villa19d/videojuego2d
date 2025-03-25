import { useState } from 'react'
import GameCanvas from './components/GameCanvas';

import './App.css'

function App() {
  return (
    <div className="App">
    <header>
      <h1>Galactic Cleaner</h1>
      <div id="score">Puntuación: 0</div>
    </header>
    <GameCanvas/>
    <footer>
      <p>Creado por [Luis Rodrigo Del Villar Morales y  ]</p>
    </footer>
    </div>
  )
}

export default App
