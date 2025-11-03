import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider, UserContext } from "./context/UserContext";
import { useContext } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Chat from "./components/Chat";


const ProtectedRoute = ({ children }) => {
  const { user } = useContext(UserContext);
  if (!user) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
        </Routes>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
