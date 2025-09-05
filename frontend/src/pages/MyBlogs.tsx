import { Link } from "react-router-dom";
import "./Blogs.scss";
import { useAuthCheck } from "../hooks/useAuthCheck";
import { useEffect, useState } from "react";
import axios from "axios";
import { useBlogEditor } from "../hooks/useBlogEditor";

export interface IArticle {
  _id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

const MyBlogs = () => {
  const {
    HOST,
    user,
    authenticated,
    message,
    isLoading,
    isError,
    refetchAuth,
  } = useAuthCheck();

  const { clearDraftById } = useBlogEditor({
    HOST,
    type: "update",
    navigate: () => {},
  });
  const [blogs, setBlogs] = useState<IArticle[]>([]);

  const handleDelete = (id: string) => {
    axios
      .delete(`${HOST}/api/articles/delete/${id}`, { withCredentials: true })
      .then(() => {
        console.log("文章删除成功");
        // 清理 localStorage 草稿
        clearDraftById(id);
        setBlogs((prev) => prev.filter((blog) => blog._id !== id));
      })
      .catch((error: any) => {
        if (error.response) {
          console.error("服务器错误", error.response.data.error);
        }
        console.error("请求失败", (error as Error).message);
      });
  };

  useEffect(() => {
    axios
      .get(`${HOST}/api/articles/mine`, { withCredentials: true })
      .then((res) => {
        setBlogs(res.data.blogs);
      })
      .catch((error: any) => {
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
            <p className="update-date">{blog.updatedAt}</p>
            <Link to={`/blogs/update/${blog._id}`}>编辑</Link>
            <button
              onClick={() => {
                handleDelete(blog._id);
              }}
            >
              删除
            </button>
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

export default MyBlogs;
