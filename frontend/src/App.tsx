import { Route, Routes } from "react-router-dom";
import Layout from "./Layout";
import MyBlogs from "./pages/Blog/MyBlogs";
import Register from "./pages/LoginRegiser/Register";
import Login from "./pages/LoginRegiser/Login";
import AllBlogs from "./pages/Blog/AllBlogs";
import BannedBooks from "./pages/Book/BannedBooks";
import NotFound from "./pages/NotFound";
import BookDetail from "./pages/Book/BookDetail";
import AllNews from "./pages/News/AllNews";
import BolgDetail from "./pages/Blog/BolgDetail";
import NewsDetail from "./pages/News/NewsDetail";
import UpdateArticle from "./pages/Blog/UpdateArticle";
import AddNew from "./pages/Blog/AddNew";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<AllBlogs />} />
        {/* 默认首页 */}
        <Route path="/users/register" element={<Register />} />
        <Route path="/users/login" element={<Login />} />

        {/* 博客 */}
        <Route path="/blogs" element={<AllBlogs />} />
        <Route path="/blogs/mine" element={<MyBlogs />} />
        <Route path="/blogs/:id" element={<BolgDetail />} />
        <Route path="/blogs/new" element={<AddNew path="articles"/>} />
        <Route path="/blogs/update/:id" element={<UpdateArticle path="articles"/>} />

        {/* 新闻 */}
        <Route path="/news-list" element={<AllNews />} />
        <Route path="/news-list/:id" element={<NewsDetail />} />
        <Route path="/news-list/new" element={<AddNew path="news-list"/>} />
        <Route
          path="/news-list/update/:id"
          element={<UpdateArticle path="news-list"  />}
        />

        {/* 禁书 */}
        <Route path="/banned-books" element={<BannedBooks />} />
        <Route path="/banned-books/:id" element={<BookDetail />} />

        {/* 404 页面通配符路由 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
