import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/landing";
// import Login from "./pages/Login";
// import Register from "./pages/Register";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        {/* <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
