// components/Footer.tsx
import "./Footer.scss";

export default function Footer() {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} 我的博客  保留所有权利。  技术支持：<a href="https://github.com/" target="_blank" rel="noopener noreferrer">GitHub</a></p>
    </footer>
  );
}