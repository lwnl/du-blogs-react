import { Route, Routes } from "react-router-dom";
import Layout from "./Layout";
import MyBlogs from "./pages/Blog/MyBlogs";
import Register from "./pages/LoginRegiser/Register";
import Login from "./pages/LoginRegiser/Login";
import NewBlog from "./pages/Blog/NewBlog";
import UpdateBlog from "./pages/Blog/UpdateBlog";
import AllBlogs from "./pages/Blog/AllBlogs";
import BannedBooks from "./pages/Book/BannedBooks";
import NotFound from "./pages/NotFound";
import BookDetail from "./pages/Book/BookDetail";
import AllNews from "./pages/News/AllNews";
import AddNews from "./pages/News/AddNews";
import BolgDetail from "./pages/Blog/BolgDetail";
import NewsDetail from "./pages/News/NewsDetail";

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
        <Route path="/blogs/new" element={<NewBlog />} />
        <Route path="/blogs/update/:id" element={<UpdateBlog />} />

        {/* 新闻 */}
        <Route path="/news-list" element={<AllNews />} />
        <Route path="/news-list/:id" element={<NewsDetail />} />
        <Route path="/news-list/new" element={<AddNews />} />
        <Route path="/blogs/update/:id" element={<UpdateBlog />} />

        {/* 禁书 */}
        <Route path="/banned-books" element={<BannedBooks />} />
        <Route path="/banned-books/:id" element={<BookDetail />} />
        {/* <Route path="/bannedBooks/:id" element={<BannedBook/>} /> */}

        {/* 404 页面通配符路由 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
