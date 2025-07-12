import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './component/Login';
import Users from './component/Users/Users';
import SignUp from './component/Users/Sign_up';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/users" element={<Users />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/auth/google_oauth2/callback" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;