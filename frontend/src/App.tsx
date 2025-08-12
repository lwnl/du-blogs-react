import { Route, Routes } from "react-router-dom";
import Layout from "./Layout";
import MyBlogs from "./pages/MyBlogs";
import Register from "./pages/Register";
import Login from "./pages/Login";
import NewBlog from "./pages/NewBlog";


export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<MyBlogs />} />{/* 默认首页 */}
        <Route path="/my-blogs" element={<MyBlogs />} />
        <Route path="/new-blog" element={<NewBlog />} />
        <Route path="/users/register" element={<Register />} />
        <Route path="/users/login" element={<Login />} />
      </Route>
    </Routes>
  );
}

