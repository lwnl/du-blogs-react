import { Link } from "react-router-dom";
import "./AllBlogs.scss";
import { useAuthCheck } from "../hooks/useAuthCheck";
import { useEffect, useState } from "react";
import axios from "axios";
import Pagination from "../components/Pagination";
import Swal from "sweetalert2";

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
    refetchAuth,
  } = useAuthCheck();

  const [blogs, setBlogs] = useState<IArticle[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 9; // 每页显示条数，可改成参数或配置
  const ulHeight = 28.8 * pageSize + 16 * (pageSize - 1); //高度根据pageSize设置为固定值
  const totalPages = Math.ceil(blogs.length / pageSize);

  // 处理翻页
  const handlePageChange = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  //当前页面数据
  const startIndex = (currentPage - 1) * pageSize;
  const currentBlogs = blogs.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    axios
      .get(`${HOST}/api/articles`)
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
      <ul className="blogs" style={{height:`${ulHeight}px`}}>
        {currentBlogs.map((blog) => (
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

      {/* 分页组件 */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

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
