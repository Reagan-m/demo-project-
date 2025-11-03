import { useState } from "react";
import { api } from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post("/users/register", { name, email, password });
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Registration failed!");
    }
  };

  return (
  <div className="container mt-5">
   <div className="row justify-content-center">
    <div className="col-md-6">
     <div className="card p-4 shadow">
    <h2 className="card-title text-center mb-4">Register</h2>
     <form onSubmit={handleRegister}>
     <div className="mb-3">
     <label className="form-label">Name</label>
      <input
        type="text"
        className="form-control"
         placeholder="Enter your name"
           value={name}
          onChange={(e) => setName(e.target.value)}
             required />
       </div>
       <div className="mb-3">
       <label className="form-label">Email</label>
        <input
          type="email"
          className="form-control"
         placeholder="Enter your email"
         value={email}
          onChange={(e) => setEmail(e.target.value)}
           required />
       </div>
      <div className="mb-3">
      <label className="form-label">Password</label>
      <input
        type="password"
        className="form-control"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required />
        </div>
      <button type="submit" className="btn btn-primary w-100">    Register  </button>
       </form>
        <p className="mt-3 text-center">
       Already have an account? <Link to="/">Login</Link>
       </p>
       </div>
        </div>
      </div>
    </div>
  );
}
