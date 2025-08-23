import { useEffect, useState, useRef } from "react";
import "./BannedBooks.scss";
import axios from "axios";
import { useAuthCheck } from "../hooks/useAuthCheck";

const BannedBooks = () => {
  interface IBannedBook {
    _id: string;
    bookName: string;
    coverLink: string;
    downloadLink: string;
    format: string;
    review: string;
    summary: string;
    comments: string[];
    createdAt: Date;
    updatedAt: Date;
  }

  const { HOST, user } = useAuthCheck();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bannedBooks, setBannedBooks] = useState<IBannedBook[] | null>(null);
  const [currentBookId, setCurrentBookId] = useState<string | null>(null);
  const [overflowMap, setOverflowMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    axios
      .get(`${HOST}/banned-books`)
      .then((res) => {
        setBannedBooks(res.data.bannedBooks);
      })
      .catch((err) => {
        const errorMsg = err.response?.data?.error || "加载禁书失败";
        setError(errorMsg);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);

  // 检查文本是否溢出
  const checkOverflow = (id: string) => {
    const el = document.getElementById(`summary-${id}`);
    if (el) {
      return el.scrollHeight > el.clientHeight;
    }
    return false;
  };

useEffect(() => {
  if (!bannedBooks) return;

  const updateOverflowMap = () => {
    const map: Record<string, boolean> = {};
    bannedBooks.forEach((book) => {
      map[book._id] = checkOverflow(book._id);
    });
    setOverflowMap(map);
  };

  // 初始化时先算一遍
  updateOverflowMap();

  // 监听窗口大小变化
  window.addEventListener("resize", updateOverflowMap);

  // 清理监听器
  return () => {
    window.removeEventListener("resize", updateOverflowMap);
  };
}, [bannedBooks]);

  if (loading) return <div className="BannedBooks">正在加载中...</div>;
  if (error) return <div className="BannedBooks">{error}</div>;

  return (
    <div className="BannedBooks">
      <ul>
        {bannedBooks?.map((book) => {
          const isExpanded = currentBookId === book._id;
          const isOverflow = overflowMap[book._id];

          return (
            <li key={book._id} className="book-item">
              <div className="book-cover">
                <div>
                  <img src={book.coverLink} alt={book.bookName} />
                </div>
                <p className="book-intro flex-column">
                  <span className="book-name" title={book.bookName}>
                    {book.bookName}
                  </span>
                  <span>文件格式：{book.format}</span>
                  <a href={book.downloadLink} target="_blank">
                    <span>下载</span>
                  </a>
                </p>
              </div>
              <div className="book-info flex-column">
                <div className="book-review">
                  <div className="book-stars">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <img
                          key={i}
                          src="https://storage.googleapis.com/daniel-jansen7879-bucket-1/projects/my-blog/images/in-books/star_null.gif"
                          alt="star-null"
                        />
                      ))}
                  </div>
                  <p>
                    <span>0 </span>分
                  </p>
                  <p>
                    <span>0 </span>人评价
                  </p>
                </div>

                <article className="flex-column">
                  <div
                    id={`summary-${book._id}`}
                    dangerouslySetInnerHTML={{ __html: book.summary }}
                    className={
                      isExpanded ? "book-summary expanded" : "book-summary"
                    }
                  ></div>
                  {isOverflow &&
                    (isExpanded ? (
                      <button onClick={() => setCurrentBookId(null)}>
                        收起
                      </button>
                    ) : (
                      <button onClick={() => setCurrentBookId(book._id)}>
                        阅读更多
                      </button>
                    ))}
                </article>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default BannedBooks;
