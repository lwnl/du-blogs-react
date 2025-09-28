import { Link } from "react-router-dom";
import "./AllArticles.scss";
import { useAuthCheck } from "../../hooks/useAuthCheck";
import { useEffect, useState } from "react";
import axios from "axios";
import Pagination from "../../components/Pagination";
import { useArticleEditor } from "../../hooks/useArticleEditor";
import Calendar from "react-calendar"; // 引入日历组件
import "react-calendar/dist/Calendar.css";
import "dayjs/locale/zh-cn";

export interface IArticle extends Document {
  _id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

type AllArticlesProps = {
  path: "articles" | "news-list";
};

const AllArticles = ({ path }: AllArticlesProps) => {
  const { HOST, user, authenticated, refetchAuth } = useAuthCheck();

  const [articles, setArticles] = useState<IArticle[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const pageSize = 10; // 每页显示条数，可改成参数或配置

  // 处理翻页
  const handlePageChange = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  // 删除文章
  const { handleDelete } = useArticleEditor({
    HOST,
    type: "update",
    path,
    onDeleted: (id) =>
      setArticles((prev) => prev.filter((article) => article._id !== id)),
    navigate: () => {},
  });

  useEffect(() => {
    let url = `${HOST}/api/${path}?pageNumber=${currentPage}&pageSize=${pageSize}`;
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;
      url += `&date=${dateStr}`;
    }
    axios
      .get(url)
      .then((res) => {
        setArticles(res.data.articles);
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
  }, [currentPage, path, selectedDate]);

  return (
    <div className="Articles-container">
      <div className="article-and-calendar">
        <ul className="articles">
          {articles.map((article) => (
            <li key={article._id}>
              <h5>
                <Link to={`/${path}/${article._id}`} target="_blank">
                  {article.title}
                </Link>
              </h5>
              <div>
                {article.author === user?.userName ? (
                  <div>
                    <Link to={`/${path}/update/${article._id}`}>
                      <span>更新</span>
                    </Link>
                    <button
                      className="delete"
                      onClick={() => {
                        handleDelete(article._id);
                      }}
                    >
                      删除
                    </button>
                    <span>{article.createdAt}</span>
                  </div>
                ) : (
                  <div>
                    {path === "articles" && <span>博主：{article.author}</span>}
                    <span>{article.createdAt}</span>
                  </div>
                )}
              </div>
            </li>
          ))}
          {authenticated && user?.role === "Administrator" ? (
            <li className="add-new">
              <Link to={`/${path}/new`}>
                <button>➕ 添加</button>
              </Link>
            </li>
          ) : (
            ""
          )}
        </ul>
        {/* 日历筛选 */}
        <div className="calendar-container">
          <h5 className="change-date">按日期浏览</h5>
          <Calendar
            onChange={(date) => setSelectedDate(date as Date)}
            value={selectedDate}
            locale="zh-CN"
            formatDay={(locale, date) => date.getDate().toString()}
          />
        </div>
      </div>
      {/* 分页组件 */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default AllArticles;
