// src/components/Header.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import "./Header.scss";
import { useAuthCheck } from "../hooks/useAuthCheck";

export default function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const {
    HOST,
    user,
    authenticated,
    message,
    isLoading,
    isError,
    refetchAuth,
  } = useAuthCheck();

  const date = new Date().toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <header>
      <div className="toolbar">
        {authenticated ? (
          <span className="register-login">用户：{user?.userName}</span>
        ) : (
          <span className="register-login">
            <Link to="/users/login">注册/登录</Link>
          </span>
        )}

        <span className="date">{date}</span>

        <button
          className="menu-button"
          aria-label="打开菜单"
          onClick={toggleSidebar}
        >
          ☰
        </button>

        <nav className="nav-links">
          <Link to="/my-blogs">博客园地</Link>
          <Link to="/downloads">禁书下载</Link>
        </nav>

        <div className="search-field">
          🔍 <input type="search" placeholder="搜索..." />
        </div>
      </div>

      {/* 侧边栏（小屏显示） */}
      <div className={`sidenav-container ${isSidebarOpen ? "open" : ""}`}>
        <aside className="sidenav">
          <div className="sidenav-header">
            <span>导航栏</span>
            <button onClick={toggleSidebar} aria-label="关闭菜单">
              ×
            </button>
          </div>

          <nav className="sidenav-links">
            <Link to="/news" onClick={toggleSidebar}>
              我的博客
            </Link>
            <Link to="/downloads" onClick={toggleSidebar}>
              禁书下载
            </Link>
          </nav>

          <div className="sidenav-search">
            🔍 <input type="search" placeholder="搜索..." />
          </div>
        </aside>

        {/* 遮罩层 */}
        <div className="overlay" onClick={toggleSidebar}></div>
      </div>
    </header>
  );
}
