import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register-Login.scss";
import Swal from "sweetalert2";

export interface IUser {
  _id: string;
  userName: string;
  password: string;
  role: "Guest" | "Registered User" | "Administrator";
}

const Register = () => {
  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [repeatPassword, setRepeatPassword] = useState<string>(""); // 单独的重复密码状态
  const navigate = useNavigate();
  const HOST = (import.meta as any).env.VITE_HOST || "";
  const [users, setUsers] = useState<IUser[]>([]);
  const [userExists, setUserExists] = useState<boolean>(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // 前端密码校验
    if (password !== repeatPassword) {
      Swal.fire("", "两次输入密码不一致", "error");
      return;
    }
    // 前端用户名校验
    if (userExists) {
      Swal.fire("", "用户名已存在", "error");
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
    } catch (error: any) {
      if (error.response) {
        const message = error.response.data.message || "注册出错！"
        Swal.fire("", message, "error");
      } else {
        Swal.fire("", "注册出错！", "error");
        console.error("Registration error", (error as Error).message);
      }
    } finally {
      setLoading(false); // 不管成功失败都恢复按钮
    }
  };

  //输入时实时检查用户名是否存在
  const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setUserName(value);
    if (value === "") {
      setUserExists(false);
      return;
    }

    const exists = users.some((u: IUser) => (u.userName === value));
    setUserExists(exists);
  };

  useEffect(() => {
    axios
      .get(`${HOST}/api/users`)
      .then((res) => {
        setUsers(res.data.users || []);
      })
      .catch(() => {
        console.error("获取用户数据出错!");
      });
  }, []);

  return (
    <form className="register" onSubmit={handleRegister}>
      <input
        type="text"
        placeholder="Username"
        value={userName}
        onChange={handleUserNameChange}
        required
      />
      {userName && (
        <p className="note">
          {userExists ? (
            <span className="error">'该用户名已存在！'</span>
          ) : (
            <span>✅ 改用户名可用！</span>
          )}
        </p>
      )}
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
