import { Link } from "react-router-dom";
import { useAuthCheck } from "../../hooks/useAuthCheck";
import { useEffect, useState } from "react";
import axios from "axios";
import Pagination from "../../components/Pagination";
import { useArticleEditor } from "../../hooks/useArticleEditor";
import Calendar from "react-calendar"; // 引入日历组件
import "react-calendar/dist/Calendar.css";
import "dayjs/locale/zh-cn";

import '../Articles/AllArticles.scss'

export interface IVideo extends Document {
  _id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  imgUrl: string;
  videoUrl: string;
  updatedAt: string;
}


const AllVideos = () => {
  const { HOST, user, authenticated, refetchAuth } = useAuthCheck();

  const [videos, setVideos] = useState<IVideo[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const pageSize = 10; // 每页显示条数，可改成参数或配置

  // 处理翻页
  const handlePageChange = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  // 删除视频
  const { handleDelete } = useArticleEditor({
    HOST,
    path:'videos',
    onDeleted: (id) =>
      setVideos((prev) => prev.filter((video) => video._id !== id)),
    navigate: () => {},
  });

  useEffect(() => {
    let url = `${HOST}/api/videos?pageNumber=${currentPage}&pageSize=${pageSize}`;
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
        setVideos(res.data.videos);
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
  }, [currentPage, selectedDate]);

  return (
    <div className="Articles-container">
      <div className="article-and-calendar">
        <ul className="articles">
          {videos.map((video) => (
            <li key={video._id}>
              <h5>
                <Link to={`/videos/${video._id}`} target="_blank">
                  {video.title}
                </Link>
              </h5>
              <div>
                {authenticated && user?.role === "Administrator" && (
                  <div>
                    <button
                      className="delete"
                      onClick={() => {
                        handleDelete(video._id);
                      }}
                    >
                      删除
                    </button>
                    <span>{video.createdAt}</span>
                  </div>
                )}
              </div>
            </li>
          ))}
          {authenticated && user?.role === "Administrator" && (
            <li className="add-new">
              <Link to={`/videos/new`}>
                <button>➕ 添加</button>
              </Link>
            </li>
          )}
        </ul>
        {/* 日历筛选 */}
        <div className="right-bar">
          <h5 className="change-date">按日期浏览</h5>
          <Calendar
            onChange={(date) => setSelectedDate(date as Date)}
            value={selectedDate}
            locale="zh-CN"
            formatDay={(locale, date) => date.getDate().toString()}
          />
          <button
            className="show-all"
            onClick={() => {
              setSelectedDate(null);
            }}
          >
            查看全部
          </button>
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

export default AllVideos;
