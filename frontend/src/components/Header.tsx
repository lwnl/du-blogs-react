// src/components/Header.tsx
import { useState } from "react";
import { NavLink } from "react-router-dom";
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
      <h2 className="website-title">51新闻</h2>
      <div className="info-bar">
        {authenticated ? (
          <span className="register-login">
            <NavLink to="/users/login">用户：{user?.userName}</NavLink>
          </span>
        ) : (
          <span className="register-login">
            <NavLink to="/users/login">注册/登录</NavLink>
          </span>
        )}
        <span className="date">{date}</span>
        <div className="search-field">
          🔍 <input type="search" placeholder="搜索..." />
        </div>
      </div>

      <div className="toolbar">
        <div className="info-bar">
          {authenticated ? (
            <span className="register-login">
              <NavLink to="/users/login">用户：{user?.userName}</NavLink>
            </span>
          ) : (
            <span className="register-login">
              <NavLink to="/users/login">注册/登录</NavLink>
            </span>
          )}
          <span className="date">{date}</span>
          <div className="search-field">
            🔍 <input type="search" placeholder="搜索..." />
          </div>
        </div>
        <button
          className="menu-button"
          aria-label="打开菜单"
          onClick={toggleSidebar}
        >
          ☰
        </button>

        <nav className="nav-links">
          <NavLink to="/news-list" end>
            要闻
          </NavLink>
          {user?.role === "Administrator" && (
            <NavLink to="/articles/mine" end>
              我的博客
            </NavLink>
          )}
          <NavLink to="/articles" end>
            博客
          </NavLink>
          <NavLink to="/banned-books">禁书</NavLink>
        </nav>
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
            <NavLink to="/news-list" onClick={toggleSidebar}>
              要闻
            </NavLink>
            <NavLink to="/articles" onClick={toggleSidebar}>
              博客
            </NavLink>
            <NavLink to="/banned-books" onClick={toggleSidebar}>
              禁书
            </NavLink>
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
