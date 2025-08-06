import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register-Login.scss";

const Login = () => {
  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true); 
  const navigate = useNavigate();
  const HOST = (import.meta as any).env.VITE_HOST;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${HOST}/users/login`,
        { userName, password },
        { withCredentials: true }
      );
      navigate("/");
    } catch (error) {
      if (error.response) {
        alert(error.response.data.message || "login failed!");
      } else {
        alert("Login error");
        console.error("Login error", (error as Error).message);
      }
    }
  };

  useEffect(() => {
    const authCheck = async () => {
      try {
        const res = await axios.get(`${HOST}/users/login-check`, { withCredentials: true });
        if (res.data.authenticated) {
          navigate("/");
        } else {
          setIsCheckingAuth(false);
        }
      } catch (error) {
        setIsCheckingAuth(false);
        console.error("Error authcheck", (error as Error).message);
      }
    };
    authCheck();
  }, []);

  if (isCheckingAuth) return <div>Checking login status...</div>;

  return (
    <form className="register" onSubmit={handleLogin}>
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

      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
