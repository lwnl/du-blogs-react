import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register-Login.scss";

const Register = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const HOST = (import.meta as any).env.VITE_HOST;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${HOST}/users/register`,
        { userName, password },
        { withCredentials: true }
      );
    } catch (error) {
      if (error.response) {
        alert(error.response.data.message || "Registration failed!");
      } else {
        alert("Registration error");
        console.error("Registration error", (error as Error).message);
      }
    }
  };

  return (
    <form className="register" onSubmit={handleRegister}>
      <input
        type="text"
        placeholder="Username"
        value={userName}
        onChange={(e) => {
          setUserName(e.target.value);
        }}
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
        }}
        required
      />

      <input
        type="password"
        placeholder="Repeat Password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
        }}
        required
      />

      <button type="submit">注册</button>

      <button
        type="button"
        className="login-link"
        onClick={() => {
          navigate("/users/login");
        }}
      >
        已注册? 登录
      </button>
    </form>
  );
};

export default Register;
