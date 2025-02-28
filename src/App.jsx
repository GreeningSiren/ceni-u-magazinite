import { Link } from 'react-router-dom'
import './App.css'

function App() {

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <header className="bg-blue-600 text-white p-4 text-center">
        <h1 className="text-4xl font-bold">Цени-У-Магазините</h1>
        <p className="text-xl mt-2">Намери от къде е най-евтино</p>
      </header>
      <main className="flex flex-col items-center mt-10">
        <div className="flex space-x-4">
          <button className="bg-green-500 text-white py-2 px-4 rounded-full hover:bg-green-700" >
            Виж Магазините
          </button>
          <button className="bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-700" >
            <Link to="/products">
            Виж Продукти
            </Link>
          </button>
        </div>
      </main>
    </div>
  )
}

export default App
