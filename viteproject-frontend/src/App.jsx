import { BrowserRouter, Routes, Route} from 'react-router-dom'
import Login from './component/Login'
import Users from './component/Users/Users';

function App() {
  return(
    <BrowserRouter>
     <Routes>
      <Route path="/" element={<Login />}/>
      <Route path="/users" element={<Users />}/>
     </Routes>
    </BrowserRouter>
  )
}

export default App