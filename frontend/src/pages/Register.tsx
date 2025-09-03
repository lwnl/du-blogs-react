import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register-Login.scss";
import Swal from "sweetalert2";

const Register = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [repeatPassword, setRepeatPassword] = useState(""); // 单独的重复密码状态
  const navigate = useNavigate();
  const HOST = (import.meta as any).env.VITE_HOST || '';

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // 前端校验
    if (password !== repeatPassword) {
      Swal.fire("", "两次输入密码不一致", "error");
      return;
    }

    if (loading) return; // 避免重复点击
    setLoading(true);

    setLoading(true);

    try {
      const res = await axios.post(
        `${HOST}/api/users/registered-user`,
        { userName, password },
        { withCredentials: true }
      );

      setPassword("");
      setRepeatPassword("");
      setUserName("");
      alert("注册成功！");
      navigate("/users/login");
    } catch (error:any) {
      if (error.response) {
        alert(error.response.data.message || "Registration failed!");
      } else {
        alert("Registration error");
        console.error("Registration error", (error as Error).message);
      }
    } finally {
      setLoading(false); // 不管成功失败都恢复按钮
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
        value={repeatPassword}
        onChange={(e) => {
          setRepeatPassword(e.target.value);
        }}
        required
      />

      <button type="submit"> {loading ? "注册中..." : "注册"}</button>

      <button
        type="button"
        className="login-link"
        onClick={() => {
          navigate("/users/login");
        }}
        disabled={loading} // 注册过程中禁用跳转
      >
        已注册? 登录
      </button>
    </form>
  );
};

export default Register;
