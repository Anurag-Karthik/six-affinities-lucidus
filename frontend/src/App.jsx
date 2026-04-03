import { useState } from 'react'
import './App.css'
import AppRouter from './router/AppRouter'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='w-screen min-h-screen bg-linear-to-b from-purple to-purple-light'>
      <AppRouter />
    </div>
  )
}

export default App
