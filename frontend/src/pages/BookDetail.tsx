import { useParams } from "react-router-dom";
import "./BookDetail.scss";
import { IBannedBook } from "./BannedBooks";
import { useEffect, useState } from "react";
import { useAuthCheck } from "../hooks/useAuthCheck";
import axios from "axios";

const BookDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<IBannedBook | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean | null>(null);
  const [isOverflow, setIsOverflow] = useState<boolean>(false);
  const {
    HOST,
    user,
    authenticated,
    message,
    isLoading,
    isError,
    refetchAuth,
  } = useAuthCheck();
  // 更新文本是否溢出

  const checkOverflow = () => {
    if (!book) return;
    const el = document.getElementById(`summary-${book._id}`);
    if (el) {
      setIsOverflow(el.scrollHeight > el.clientHeight);
    }
  };

  useEffect(() => {
    if (!id) return;
    axios
      .get(`${HOST}/banned-books/${id}`)
      .then((res) => {
        setBook(res.data.book);

        //检查文本溢出并挂载监听器
        checkOverflow();
        window.addEventListener("resize", checkOverflow);
        return () => {
          window.removeEventListener("resize", checkOverflow);
        };
      })
      .catch((error) => {
        console.error("加载书籍失败：", (error as Error).message);
      });
  }, [id]);

  if (book)
    return (
      <div className="book-detail">
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
              className={isExpanded ? "book-summary expanded" : "book-summary"}
            ></div>
            {isOverflow &&
              (isExpanded ? (
                <button onClick={() => setIsExpanded(false)}>收起</button>
              ) : (
                <button onClick={() => setIsExpanded(true)}>
                  阅读更多
                </button>
              ))}
          </article>
        </div>
      </div>
    );
};

export default BookDetail;
