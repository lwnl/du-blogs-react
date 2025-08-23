import { useEffect, useState } from "react";
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

  const [currentBookId, setCurrentBookId] = useState<string | null>(null);
  const { HOST, authenticated, user } = useAuthCheck();
  const [loading, setLoading] = useState(true); // <-- 新增 loading 状态
  const [error, setError] = useState<string | null>(null); // <-- 错误状态
  const [bannedBooks, setBannedBooks] = useState<IBannedBook[] | null>(null);

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

  if (loading) {
    return <div className="BannedBooks">正在加载中...</div>; // loading 提示
  }

  if (error) {
    return <div className="BannedBooks">{error}</div>; // 错误提示
  }

  return (
    <div className="BannedBooks">
      <ul>
        {bannedBooks?.map((book) => {
          const isExpanded = currentBookId === book._id;
          return (
            <li key={book._id} className="book-item">
              <div className="book-cover">
                <div>
                  <img src={book.coverLink} alt={book.bookName} />
                </div>
                <p className="book-intro flex-column">
                  <span className="book-name">{book.bookName}</span>
                  <span>文件格式：{book.format}</span>
                  <a href={book.downloadLink} target="_blank">
                    <span>下载</span>
                  </a>
                </p>
              </div>
              <div className="book-info flex-column">
                <div className="book-review">
                  <div className="book-stars">
                    <img
                      src="https://storage.googleapis.com/daniel-jansen7879-bucket-1/projects/my-blog/images/in-books/star_null.gif"
                      alt="star-null"
                    />
                    <img
                      src="https://storage.googleapis.com/daniel-jansen7879-bucket-1/projects/my-blog/images/in-books/star_null.gif"
                      alt="star-null"
                    />
                    <img
                      src="https://storage.googleapis.com/daniel-jansen7879-bucket-1/projects/my-blog/images/in-books/star_null.gif"
                      alt="star-null"
                    />
                    <img
                      src="https://storage.googleapis.com/daniel-jansen7879-bucket-1/projects/my-blog/images/in-books/star_null.gif"
                      alt="star-null"
                    />
                    <img
                      src="https://storage.googleapis.com/daniel-jansen7879-bucket-1/projects/my-blog/images/in-books/star_null.gif"
                      alt="star-null"
                    />
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
                    dangerouslySetInnerHTML={{ __html: book.summary }}
                    className={
                      isExpanded ? "book-summary expanded" : "book-summary"
                    }
                  ></div>
                  {isExpanded ? (
                    <button onClick={() => setCurrentBookId(null)}>收起</button>
                  ) : (
                    <button onClick={() => setCurrentBookId(book._id)}>
                      阅读更多
                    </button>
                  )}
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
