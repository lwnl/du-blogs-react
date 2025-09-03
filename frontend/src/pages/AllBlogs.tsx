import { Link } from "react-router-dom";
import "./Blogs.scss";
import { useAuthCheck } from "../hooks/useAuthCheck";
import { useEffect, useState } from "react";
import axios from "axios";

export interface IArticle extends Document {
  _id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

const AllBlogs = () => {
  const {
    user,
    authenticated,
    message,
    isLoading,
    isError,
    refetchAuth,
  } = useAuthCheck();
  const [blogs, setBlogs] = useState<IArticle[]>([]);

  const HOST = import.meta.env.VITE_HOST;

  console.log('HOST is', HOST)

  useEffect(() => {
    axios
      .get(`${HOST}/api/articles`)
      .then((res) => {
        setBlogs(res.data.blogs);
      })
      .catch((error:any) => {
        if (error.response) {
          // 后端返回的错误响应
          console.error("后端错误消息:", error.response.data.error);
        } else {
          // 网络错误或其他错误
          console.error("请求错误:", error.message);
        }
      });
  }, []);

  return (
    <div className="Blogs-container">
      <ul className="blogs">
        {blogs.map((blog) => (
          <li key={blog._id}>
            <h5>
              <Link to={`/blogs/${blog._id}`}>{blog.title}</Link>
            </h5>
            <div className="blog-info">
              <span>作者：{blog.author}</span>
              <span>更新： {blog.updatedAt}</span>
            </div>
          </li>
        ))}
      </ul>

      {authenticated && user?.role === "Registered User" ? (
        <div className="add-blog">
          <Link to="/blogs/new">
            <button>新建博客</button>
          </Link>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default AllBlogs;
