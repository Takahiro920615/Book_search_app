import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './component/Login';
import Users from './component/Users/Users';
import SignUp from './component/Users/Sign_up';
import Books from './component/book/books.tsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/users" element={<Users />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/users/:userId/books" element={<Books />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;