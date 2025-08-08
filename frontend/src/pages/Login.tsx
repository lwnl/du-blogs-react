import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register-Login.scss";
import { useAuthCheck } from "../hooks/useAuthCheck";

const Login = () => {
  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const navigate = useNavigate();

  const { HOST, authenticated, isLoading, refetchAuth } = useAuthCheck();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${HOST}/users/login`,
        { userName, password },
        { withCredentials: true }
      );
      await refetchAuth(); // 登录成功后刷新登录状态
      setMessage(""); // 清空旧的错误信息
      navigate('/')
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setMessage(error.response.data.message || "Login failed!");
      } else {
        setMessage("Login error");
        console.error("Login error", (error as Error).message);
      }
    }
  };

  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${HOST}/users/logout`, {}, { withCredentials: true });
      await refetchAuth(); // 登出后刷新状态
    } catch (error) {
      console.error("Logout error", (error as Error).message);
    }
  };

  if (isLoading)
    return (
      <div className="authCheck">
        <p>Checking login status...</p>
      </div>
    );

  if (authenticated)
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

      {/* 登录状态消息提示 */}
      {message && <p className="error">{message}</p>}
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
