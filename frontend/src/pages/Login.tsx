import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register-Login.scss";

const Login = () => {
  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [isLogin, setIsLogin] = useState<boolean>(false);
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
      setIsLogin(true);
    } catch (error) {
      if (error.response) {
        alert(error.response.data.message || "login failed!");
      } else {
        alert("Login error");
        console.error("Login error", (error as Error).message);
      }
    }
  };

  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLogin(false)
  };

  useEffect(() => {
    const authCheck = async () => {
      try {
        const res = await axios.get(`${HOST}/users/login-check`, {
          withCredentials: true,
        });
        if (res.data.authenticated) {
          setIsLogin(true);
        } else {
        }
      } catch (error) {
        console.error("Error authcheck", (error as Error).message);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    authCheck();
  }, []);

  if (isCheckingAuth)
    return (
      <div className="authCheck">
        <p>Checking login status...</p>
      </div>
    );

  if (isLogin)
    return (
      <form className="login" onSubmit={handleLogout}>
        <p>You are already logged in!</p>
        <button type="submit">Logout</button>
      </form>
    );

  return (
    <form className="login" onSubmit={handleLogin}>
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
