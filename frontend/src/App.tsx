import { Route, Routes } from "react-router-dom";
import Layout from "./Layout";
import MyBlogs from "./pages/MyBlogs";
import Register from "./pages/Register";
import Login from "./pages/Login";
import NewBlog from "./pages/NewBlog";
import Blog from "./pages/Bolg";
import UpdateBlog from "./pages/UpdateBlog";
import AllBlogs from "./pages/AllBlogs";
import BannedBooks from "./pages/BannedBooks";
import NotFound from "./pages/NotFound";


export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<AllBlogs />} />{/* 默认首页 */}
        <Route path="/users/register" element={<Register />} />
        <Route path="/users/login" element={<Login />} />
        <Route path="/blogs" element={<AllBlogs />} />
        <Route path="/blogs/:id" element={<Blog />} />
        <Route path="/blogs/new" element={<NewBlog />} />
        <Route path="/blogs/update/:id" element={<UpdateBlog />} />
        <Route path="/blogs/mine" element={<MyBlogs />} />
        <Route path="/bannedBooks" element={<BannedBooks />} />
        {/* <Route path="/bannedBooks/:id" element={<BannedBook/>} /> */}

         {/* 404 页面通配符路由 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

