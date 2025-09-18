import { Link } from "react-router-dom";
import "./AllBlogs_AllNews.scss";
import { useAuthCheck } from "../hooks/useAuthCheck";
import { useEffect, useState } from "react";
import axios from "axios";
import { useBlogEditor } from "../hooks/useBlogEditor";
import Swal from "sweetalert2";
import Pagination from "../components/Pagination";

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

  const { clearDraftById } = useBlogEditor({
    HOST,
    type: "update",
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

  const handleDelete = (id: string) => {
    Swal.fire({
      title: "确定删除吗？",
      text: "此操作不可撤销！",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "确定",
      cancelButtonText: "取消",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`${HOST}/api/articles/delete/${id}`, {
            withCredentials: true,
          })
          .then(() => {
            console.log("文章删除成功");
            // 清理 localStorage 草稿
            clearDraftById(id);
            setBlogs((prev) => prev.filter((blog) => blog._id !== id));
            //删除成功提示
            Swal.fire("已删除!", "文章已成功删除。", "success");
          })
          .catch((error: any) => {
            if (error.response) {
              console.error("服务器错误", error.response.data.error);
            }
            console.error("请求失败", (error as Error).message);
            // 删除失败提示
            Swal.fire("删除失败", "请稍后重试。", "error");
          });
      }
    });
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
    <div className="Blogs-container">
      <ul className="blogs" >
        {blogs.map((blog) => (
          <li key={blog._id}>
            <h5>
              <Link to={`/blogs/${blog._id}`} target="_blank">{blog.title}</Link>
            </h5>
            <p className="update-date">更新：{blog.updatedAt}</p>
            <Link to={`/blogs/update/${blog._id}`}>编辑</Link>
            <button
              className="delete"
              onClick={() => {
                handleDelete(blog._id);
              }}
            >
              删除
            </button>
          </li>
        ))}
        {authenticated && user?.role === "Administrator" ? (
          <li className="add-blog">
            <Link to="/blogs/new">
              <button>新建博客</button>
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
