import { Link, useParams } from "react-router-dom";
import "./BookDetail.scss";
import { IBannedBook } from "./BannedBooks";
import { useEffect, useState } from "react";
import { useAuthCheck } from "../hooks/useAuthCheck";
import axios from "axios";
import TextareaAutosize from "react-textarea-autosize";
import Swal from "sweetalert2";
import StarRating, { starNull, starOne } from "../components/StarRating";

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
  const [currentRating, setCurrentRating] = useState<number | null>(5); // rating 为当前用户评分，默认为满分

  const {
    HOST,
    user,
    authenticated,
    message,
    isLoading,
    isError,
    refetchAuth,
  } = useAuthCheck();

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
            refetchAuth(); //重新校验用户身份
            //用游客身份发表评论
            await postComment();
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
  const postComment = async () => {
    try {
      const newComment = {
        author: user?.userName,
        content: newCommentContent,
        rating: currentRating,
      };
      const res = await axios.patch(
        `${HOST}/banned-books/${bookId}/comments/new`,
        {
          newComment,
        },
        { withCredentials: true }
      );

      Swal.fire({
        icon: "success",
        title: "发表评论成功！",
        timer: 1500,
        showConfirmButton: false,
      });
      setNewCommentContent("");

      // 更新评论列表
      const { updatedBook } = res.data;
      setComments(updatedBook.comments);
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
      await axios.delete(
        `${HOST}/banned-books/${bookId}/comments/${commentId}`,
        {
          withCredentials: true,
        }
      );
      setComments((prev) => prev?.filter((c) => c._id !== commentId) || null);
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
        setCurrentRating(Number(res.data.currentRating) - 1 || 4);
        console.log("currentRating is：", currentRating);
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
                .map((_, i) => (
                  <img key={i} src={starOne} alt="star-one" />
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
                <button onClick={() => setIsExpanded(true)}>阅读更多</button>
              ))}
          </article>

          {/* 评论留言 */}
          <form className="comments-form" onSubmit={submitComment}>
            <StarRating
              submitRating={(score) => {
                setCurrentRating(score);
              }}
              currentRating={currentRating}
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
