import { Link, useParams } from "react-router-dom";
import "./BookDetail.scss";
import type { IBannedBook } from "./BannedBooks";
import { useEffect, useRef, useState } from "react";
import { useAuthCheck } from "../hooks/useAuthCheck";
import axios from "axios";
import TextareaAutosize from "react-textarea-autosize";
import Swal from "sweetalert2";
import UserRating, {
  starNull,
  starOne,
  starHalf,
} from "../components/UserRating";

export interface IComment {
  _id: string;
  author: string;
  content: string;
  rating: number;
}

const BookDetail = () => {
  const { id: bookId } = useParams<{ id: string }>();
  const [book, setBook] = useState<IBannedBook | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean | null>(null);
  const [isOverflow, setIsOverflow] = useState<boolean>(false);
  const [newCommentContent, setNewCommentContent] = useState("");
  const [comments, setComments] = useState<IComment[]>([]);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>("");
  const [currentRating, setCurrentRating] = useState<number | null>(null); // rating 为当前用户评分
  const currentRatingRef = useRef<number | null>(null);
  const [ratingResult, setRatingResult] = useState<number>(0);

  const _setCurrentRating = (value: number | null) => {
    setCurrentRating(value);
    currentRatingRef.current = value;
  };

  const {
    HOST,
    user,
    authenticated,
    message,
    isLoading,
    isError,
    refetchAuth,
  } = useAuthCheck();

  // 提交评论和评分数据
  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    // 判断用户是否登录
    // 若未登录，使用Swal弹出对话框询问用户是否以游客身份发表评论？
    if (!authenticated || user?.role === "Guest") {
      const result = await Swal.fire({
        title: "您尚未登录",
        text: "是否以游客身份发表评论？",
        showCancelButton: true,
        confirmButtonText: "是",
        cancelButtonText: "否",
      });

      if (result.isConfirmed) {
        // 创建游客用户 或者 使用当前游客身份

        // 检查是否具备游客身份
        if (user?.role === "Guest") {
          //用游客身份发表评论
          await postComment();
        } else {
          // 若还没有游客身份，创建游客身份
          try {
            await axios.post(
              `${HOST}/users/guests/new`,
              {},
              {
                withCredentials: true,
              }
            );
            const authData = await refetchAuth();
            await postComment(authData.data?.user?.userName);
          } catch (error) {
            console.error("创建游客失败", (error as Error).message);
            Swal.fire("", "创建游客失败", "error");
          }
        }
      } else {
        // 用户选择取消，不发表评论
        Swal.fire("已取消", "", "info");
      }
      return;
    }

    //注册用户发表留言
    await postComment();
  };

  // 发表评论子程序
  const postComment = async (authorOverride?: string) => {
    try {
      //用户没有手动设置，默认评分为满分
      !currentRating && _setCurrentRating(5);
      console.log("currentRatingRef.current:", currentRatingRef.current);
      console.log("currentRating is", currentRating);
      const newComment = {
        author: authorOverride || user?.userName,
        content: newCommentContent,
        rating: currentRating ?? currentRatingRef.current, //用户没有手动设置，默认评分为满分
      };
      const res = await axios.patch(
        `${HOST}/banned-books/${bookId}/comments/new`,
        { newComment },
        { withCredentials: true }
      );

      Swal.fire({
        icon: "success",
        title: "发表评论成功！",
        timer: 1500,
        showConfirmButton: false,
      });

      setNewCommentContent("");

      const { updatedBook } = res.data;
      setComments(updatedBook.comments);
      setRatingResult(updatedBook.ratingResult);
    } catch (error) {
      console.error("发表评论失败", (error as Error).message);
      Swal.fire("", "发表评论失败", "error");
    }
  };

  // 更新评论内容
  const saveEditedComment = async (
    commentId: string,
    updatedContent: string
  ) => {
    if (!updatedContent.trim()) {
      Swal.fire("", "评论内容不能为空！", "error");
      return;
    }

    try {
      const { data } = await axios.patch(
        `${HOST}/banned-books/${bookId}/comments/update/${commentId}`,
        { updatedContent },
        { withCredentials: true }
      );

      setComments(data.updatedBook.comments);

      // 重置编辑状态
      setEditingContent("");
      setEditingCommentId(null);

      Swal.fire({
        icon: "success",
        title: "评论已更新",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("更新评论失败:", err);
      Swal.fire("", "更新评论失败", "error");
    }
  };

  // 删除评论内容
  const deleteComment = async (commentId: string) => {
    const result = await Swal.fire({
      title: "确认删除？",
      showCancelButton: true,
      confirmButtonText: "删除",
      cancelButtonText: "取消",
    });
    if (!result.isConfirmed) return;

    try {
      const res = await axios.delete(
        `${HOST}/banned-books/${bookId}/comments/${commentId}`,
        {
          withCredentials: true,
        }
      );
      
      const { updatedBook } = res.data;
      setComments(updatedBook.comments);
      setRatingResult(updatedBook.ratingResult);

      Swal.fire({
        icon: "success",
        title: "评论已删除",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      Swal.fire("", "删除评论失败", "error");
    }
  };

  useEffect(() => {
    if (!bookId) return;
    axios
      .get(`${HOST}/banned-books/${bookId}`, { withCredentials: true })
      .then((res) => {
        console.log("res.data=", res.data);
        setBook(res.data.book);
        if (res.data.currentRating) {
          setCurrentRating(res.data.currentRating);
          currentRatingRef.current = currentRating;
        }
        console.log("前端res.data.currentRating is", res.data.currentRating);
        setRatingResult(res.data.book.ratingResult);
        setComments(res.data.book.comments);
      })
      .catch((error) => {
        console.error("加载书籍失败：", (error as Error).message);
      });
  }, [bookId]);

  useEffect(() => {
    if (!book) return;
    // 检查溢出函数
    const checkOverflow = () => {
      const el = document.getElementById(`summary-${book._id}`);
      if (el) {
        const overflow = el.scrollHeight > el.clientHeight;
        setIsOverflow(overflow);
      }
    };

    // 初始检查
    checkOverflow();

    // 监听窗口变化
    window.addEventListener("resize", checkOverflow);

    return () => {
      window.removeEventListener("resize", checkOverflow);
    };
  }, [book]);

  if (book)
    return (
      <div className="book-detail">
        {/* 封面信息 */}
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
        {/* 评分，简介 */}
        <div className="book-info flex-column">
          <div className="book-review">
            <div className="book-stars">
              {Array(5)
                .fill(0)
                .map((_, i) => {
                  let starIcon;
                  if (i + 1 <= ratingResult) {
                    starIcon = starOne; // 满星
                  } else if (i < ratingResult && ratingResult < i + 1) {
                    starIcon = starHalf; // 半星
                  } else {
                    starIcon = starNull; // 空星
                  }
                  return <img key={i} src={starIcon} alt={`star-${i}`} />;
                })}
            </div>
            <p>
              <span>{ratingResult} </span>分
            </p>
            <p>
              <span>{comments.length} </span>评价
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
                <button onClick={() => setIsExpanded(true)}>阅读更多</button>
              ))}
          </article>

          {/* 评论留言 */}
          <form className="comments-form" onSubmit={submitComment}>
            <UserRating
              submitRating={(score) => {
                setCurrentRating(score);
              }}
              starIndex={(currentRating ?? 1) - 1}
            />
            <TextareaAutosize
              placeholder="撰写留言"
              value={newCommentContent}
              minRows={2}
              onChange={(e) => setNewCommentContent(e.target.value)}
            />
            <button>提交</button>
          </form>

          {/* 展示评论 */}
          <div className="show-comments">
            {comments?.map((comment) => (
              <div key={comment._id} className="comment-item">
                <div className="comment-author">
                  <p>{comment.author}评分：</p>
                  <div className="book-stars">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <img
                          key={i}
                          src={i < comment.rating ? starOne : starNull}
                          alt="star-one"
                        />
                      ))}
                  </div>
                </div>

                {editingCommentId === comment._id ? (
                  // 编辑模式
                  <>
                    <TextareaAutosize
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      minRows={2}
                    />
                    <div className="button-container">
                      <button
                        type="button"
                        onClick={() =>
                          saveEditedComment(comment._id, editingContent)
                        }
                      >
                        更新
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCommentId(null);
                          setEditingContent("");
                        }}
                      >
                        取消
                      </button>
                    </div>
                  </>
                ) : (
                  // 查看模式 - 直接显示内容
                  <>
                    <div className="comment-content">{comment.content}</div>
                    {user?.userName === comment.author && (
                      <div className="button-container">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCommentId(comment._id);
                            setEditingContent(comment.content);
                          }}
                        >
                          编辑
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteComment(comment._id)}
                        >
                          删除
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {/* 返回 */}
          <div className="back-to">
            <p>
              <Link to="/banned-books">返回</Link>
            </p>
          </div>
        </div>
      </div>
    );
  else return <div>正在加载书籍信息...</div>;
};

export default BookDetail;
