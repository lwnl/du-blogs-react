import { Link } from "react-router-dom";
import "../Blog/AllBlogs_AllNews.scss";
import { useAuthCheck } from "../../hooks/useAuthCheck";
import { useEffect, useState } from "react";
import axios from "axios";
import Pagination from "../../components/Pagination";
import { useArticleEditor } from "../../hooks/useArticleEditor";

export interface INews extends Document {
  _id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

const AllNews = () => {
  const { HOST, user, authenticated, refetchAuth } = useAuthCheck();

  const { handleDelete } = useArticleEditor({
    HOST,
    type: "update",
    path: "news-list",
    onDeleted: (id) =>
      setNewsList((prev) => prev.filter((news) => news._id !== id)),
    navigate: () => {},
  });

  const [newsList, setNewsList] = useState<INews[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const pageSize = 10; // 每页显示条数，可改成参数或配置

  // 处理翻页
  const handlePageChange = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    axios
      .get(
        `${HOST}/api/news-list?pageNumber=${currentPage}&pageSize=${pageSize}`
      )
      .then((res) => {
        setNewsList(res.data.newsList || []);
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
  }, [currentPage]);

  return (
    <div className="newsList-container">
      <ul className="news-list">
        {newsList.map((news) => (
          <li key={news._id}>
            <h5>
              <Link to={`/news-list/${news._id}`} target="_blank">
                {news.title}
              </Link>
            </h5>
            {news.author === user?.userName ? (
              <div>
                <Link to={`/news-list/update/${news._id}`}>编辑</Link>
                <button
                  className="delete"
                  onClick={() => handleDelete(news._id)}
                >
                  删除
                </button>
                <span className="update-date">更新：{news.updatedAt}</span>
              </div>
            ) : (
              <div>
                <span>用户：{news.author}</span>
                <span>更新：{news.updatedAt}</span>
              </div>
            )}
          </li>
        ))}
        {authenticated && user?.role === "Administrator" ? (
          <li className="add-blog">
            <Link to="/news-list/new">
              <button>添加新闻</button>
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

export default AllNews;
