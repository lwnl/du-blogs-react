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
    HOST,
    user,
    authenticated,
    message,
    isLoading,
    isError,
    refetchAuth,
  } = useAuthCheck();
  const [blogs, setBlogs] = useState<IArticle[]>([]);

  useEffect(() => {
    axios
      .get(`${HOST}/articles`)
      .then((res) => {
        setBlogs(res.data.blogs);
      })
      .catch((error) => {
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
              <Link to={`/all-blogs/${blog._id}`}>{blog.title}</Link>
            </h5>
            <p>{blog.updatedAt}</p>
          </li>
        ))}
      </ul>

      {authenticated ? (
        <div className="add-blog">
          <Link to="/new-blog">
            <button>添加一条博客</button>
          </Link>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default AllBlogs;
