import { Link } from "react-router-dom";
import "./AllArticles.scss";
import { useAuthCheck } from "../../hooks/useAuthCheck";
import { useEffect, useState } from "react";
import axios from "axios";
import { useArticleEditor } from "../../hooks/useArticleEditor";
import Pagination from "../../components/Pagination";

export interface IArticle {
  _id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

const MyBlogs = () => {
  const { HOST, user, authenticated, refetchAuth } = useAuthCheck();

  const { handleDelete } = useArticleEditor({
    HOST,
    type: "update",
    path: "articles",
    onDeleted: (id) =>
      setBlogs((prev) => prev.filter((blog) => blog._id !== id)),
    navigate: () => {},
  });

  const [blogs, setBlogs] = useState<IArticle[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const pageSize = 10;

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber > totalPages || pageNumber < 1) return;
    setCurrentPage(pageNumber);
  };


  useEffect(() => {
    if (authenticated && user?.role === "Administrator") {
      axios
        .get(
          `${HOST}/api/articles/mine?pageNumber=${currentPage}&pageSize=${pageSize}`,
          {
            withCredentials: true,
          }
        )
        .then((res) => {
          setBlogs(res.data.blogs);
          setTotalPages(Math.ceil(res.data.total / pageSize) || 1);
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
    }
  }, [currentPage]);

  return (
    <div className="Articles-container">
      <ul className="articles">
        {blogs.map((blog) => (
          <li key={blog._id}>
            <h5>
              <Link to={`/articles/${blog._id}`} target="_blank">
                {blog.title}
              </Link>
            </h5>
            
            <Link to={`/articles/update/${blog._id}`}>编辑</Link>
            <button
              className="delete"
              onClick={() => {
                handleDelete(blog._id);
              }}
            >
              删除
            </button>
            <p className="update-date">{blog.updatedAt}</p>
          </li>
        ))}
        {authenticated && user?.role === "Administrator" ? (
          <li className="add-new">
            <Link to="/articles/new">
              <button>➕ 添加</button>
            </Link>
          </li>
        ) : (
          ""
        )}
      </ul>

      {/* 分页组件 */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default MyBlogs;
