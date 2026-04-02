import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import AppRouter from './router/AppRouter'
import Header from './components/header'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <Header />
      <AppRouter />
    </div>

  )
}

export default App
