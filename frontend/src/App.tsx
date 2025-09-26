import { Route, Routes } from "react-router-dom";
import Layout from "./Layout";
import MyBlogs from "./pages/Articles/MyBlogs";
import Register from "./pages/LoginRegiser/Register";
import Login from "./pages/LoginRegiser/Login";
import BannedBooks from "./pages/Book/BannedBooks";
import NotFound from "./pages/NotFound";
import BookDetail from "./pages/Book/BookDetail";
import UpdateArticle from "./pages/Articles/UpdateArticle";
import AddNew from "./pages/Articles/AddNew";
import ArticleDetail from "./pages/Articles/ArticleDetail";
import AllArticles from "./pages/Articles/AllArticles";
import AddBannedBook from "./pages/Book/AddBannedBook";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<AllArticles path='news-list'/>} />
        {/* 默认首页 */}
        <Route path="/users/register" element={<Register />} />
        <Route path="/users/login" element={<Login />} />

        {/* 博客 */}
        <Route path="/articles" element={<AllArticles path='articles'/>} />
        <Route path="/articles/mine" element={<MyBlogs />} />
        <Route
          path="/articles/:id"
          element={<ArticleDetail commentType="blog" path="articles" />}
        />
        <Route path="/articles/new" element={<AddNew path="articles" />} />
        <Route
          path="/articles/update/:id"
          element={<UpdateArticle path="articles" />}
        />

        {/* 新闻 */}
        <Route path="/news-list" element={<AllArticles path='news-list'/>} />
        <Route
          path="/news-list/:id"
          element={<ArticleDetail commentType="news" path="news-list" />}
        />
        <Route path="/news-list/new" element={<AddNew path="news-list" />} />
        <Route
          path="/news-list/update/:id"
          element={<UpdateArticle path="news-list" />}
        />

        {/* 禁书 */}
        <Route path="/banned-books" element={<BannedBooks />} />
        <Route path="/banned-books/:id" element={<BookDetail />} />
        <Route path="/banned-books/add" element={<AddBannedBook />} />

        {/* 404 页面通配符路由 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
