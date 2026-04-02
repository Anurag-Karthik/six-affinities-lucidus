import { useState } from 'react'
import './App.css'
import AppRouter from './router/AppRouter'
import Header from './components/header'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='w-screen h-screen bg-linear-to-b from-purple to-purple-light'>
      <Header />
      <AppRouter />
    </div>
  )
}

export default App
