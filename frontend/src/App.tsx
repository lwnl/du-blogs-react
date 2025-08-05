import { Route, Routes } from "react-router-dom";
import Layout from "./Layout";
import MyBlogs from "./pages/MyBlogs";
import Register from "./pages/Register";


export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<MyBlogs />} />
        <Route path="/users/register" element={<Register />} />
      </Route>
    </Routes>
    // <Layout />
  );
}

