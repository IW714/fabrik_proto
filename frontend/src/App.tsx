import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import SavedImages from './pages/SavedImages'
import './App.css'


function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="saved" element={<SavedImages />} />
      </Route>
    </Routes>
  )
}

export default App
