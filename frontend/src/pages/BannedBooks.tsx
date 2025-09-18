import { useEffect, useState, useRef } from "react";
import "./BannedBooks.scss";
import axios from "axios";
import { useAuthCheck } from "../hooks/useAuthCheck";
import { Link } from "react-router-dom";
import { starHalf, starNull, starOne } from "../components/UserRating";

export interface IBannedBook {
  _id: string;
  bookName: string;
  coverLink: string;
  downloadLink: string;
  format: string;
  review: string;
  summary: string;
  comments: string[];
  ratingResult: number;
  createdAt: Date;
  updatedAt: Date;
}

const BannedBooks = () => {
  const { HOST, user } = useAuthCheck();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bannedBooks, setBannedBooks] = useState<IBannedBook[] | null>(null);
  const [currentBookId, setCurrentBookId] = useState<string | null>(null);
  const [overflowMap, setOverflowMap] = useState<Record<string, boolean>>({});

  // 检查文本是否溢出
  const checkOverflow = (id: string) => {
    const el = document.getElementById(`summary-${id}`);
    if (el) {
      return el.scrollHeight > el.clientHeight;
    }
    return false;
  };

  console.log("HOST is:", HOST);

  useEffect(() => {
    console.log("HOST is:", HOST);
    axios
      .get(`${HOST}/api/banned-books`)
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
          const rating = book.ratingResult;

          return (
            <li key={book._id} className="book-item">
              <div className="book-cover">
                <div>
                  <Link to={`/banned-books/${book._id}`}>
                    <img src={book.coverLink} alt={book.bookName} />
                  </Link>
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
                      .map((_, i) => {
                        let starIcon;
                        if (i + 1 <= rating) {
                          starIcon = starOne; // 满星
                        } else if (i < rating && rating < i + 1) {
                          starIcon = starHalf; // 半星
                        } else {
                          starIcon = starNull; // 空星
                        }
                        return <img key={i} src={starIcon} alt={`star-${i}`} />;
                      })}
                  </div>
                  <p>
                    <Link to={`./${book._id}`}>
                      <span>{rating} </span>分
                    </Link>
                  </p>
                  <p>
                    <Link to={`./${book._id}`}>
                      <span>{book.comments.length} </span>评价
                    </Link>
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
