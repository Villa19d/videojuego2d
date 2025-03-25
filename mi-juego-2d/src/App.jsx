import { useState } from 'react'
import GameCanvas from './components/GameCanvas';

import './App.css'

function App() {
  return (
    <div className="App">
    <header>
      <h1>Galactic Cleaner</h1>
    </header>
    <GameCanvas/>
    <footer>
      <p>Creado por [Luis Rodrigo Del Villar Morales y Lizeth Anahí Gonzalez Ordaz]</p>
    </footer>
    </div>
  )
}

export default App
