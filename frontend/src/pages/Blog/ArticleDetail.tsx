// src/pages/Blog.tsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import type { IArticle } from "./MyBlogs";
import { useAuthCheck } from "../../hooks/useAuthCheck";
import "./Blog_News.scss";
import Swal from "sweetalert2";
import TextareaAutosize from "react-textarea-autosize";

export interface IComment {
  _id: string;
  subjectId: string;
  content: string;
  user: string;
  createdAt: string;
  updatedAt: string;
}

type ArticleProps = {
  commentType: "blog" | "news";
  path: "articles" | "news-list";
};

const ArticleDetail = ({ commentType, path }: ArticleProps) => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<IArticle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState<string>("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>("");
  const [comments, setComments] = useState<IComment[] | null>(null);
  const navigate = useNavigate();

  const { HOST, user, authenticated, refetchAuth } = useAuthCheck();

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) {
      Swal.fire("", "评论内容不能为空！", "error");
      return;
    }

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
              `${HOST}/api/users/guests/new`,
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
    if (!article?._id || !newComment.trim()) return;

    try {
      const res = await axios.post(
        `${HOST}/api/comments/new`,
        {
          subjectId: article._id,
          content: newComment,
          type: commentType,
        },
        { withCredentials: true }
      );

      Swal.fire({
        icon: "success",
        title: "发表评论成功！",
        timer: 1500,
        showConfirmButton: false,
      });
      setNewComment("");

      // 更新评论列表
      const { newComment: createdComment } = res.data;
      //最新留言置顶
      setComments((prev) => [createdComment, ...(prev || [])]);
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
        `${HOST}/api/comments/update/${commentId}`,
        { content: updatedContent },
        { withCredentials: true }
      );

      const updatedComment = data.updatedComment;

      setComments((prev) => {
        if (!prev) return [];
        const updated = prev.map((c) =>
          c._id.toString() === commentId.toString() ? updatedComment : c
        );
        return updated;
      });

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

  const deleteComment = async (commentId: string) => {
    const result = await Swal.fire({
      title: "确认删除？",
      showCancelButton: true,
      confirmButtonText: "删除",
      cancelButtonText: "取消",
    });
    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${HOST}/api/comments/delete/${commentId}`, {
        withCredentials: true,
      });
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
    if (!id) return;

    setLoading(true);

    axios
      .get(`${HOST}/api/${path}/${id}`)
      .then((res) => {
        setArticle(res.data.article);
        setComments(res.data.comments);
        setError(null);
      })
      .catch((err) => {
        setError(err.response?.data?.error || "加载文章失败");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!loading && !article) {
      Swal.fire({
        title: "",
        text: "该文章不存在！",
        icon: "error",
        timer: 1500, // 1.5秒后自动关闭
        showConfirmButton: false,
      }).then(() => {
        if (path === "articles") {
          if (user?.role === "Registered User") {
            navigate("/blogs/mine");
          } else {
            navigate("/blogs");
          }
        } else {
          navigate("/news-list");
        }
      });
    }
  }, [loading, article, user, navigate]);

  if (loading) return <div>加载中...</div>;
  if (!article) return null;

  return (
    <div className="Blog">
      <div className="title-container">
        <h3 className="title">{article.title}</h3>
        <div>
          <span className="author">用户： {article.author}</span>
          <span>更新： {article.updatedAt}</span>
        </div>
      </div>

      {/* 将 article.content 里的 HTML 字符串直接渲染成真正的 HTML 结构 */}
      <article
        className="article-content"
        dangerouslySetInnerHTML={{ __html: article.content }}
      ></article>

      {/* 评论留言 */}
      <form className="comments-form" onSubmit={submitComment}>
        <p className="title">评论</p>
        <TextareaAutosize
          placeholder="撰写评论"
          value={newComment}
          minRows={2}
          onChange={(e) => {
            setNewComment(e.target.value);
          }}
        />
        <button>发表留言</button>
      </form>

      {/* 展示评论 */}
      <div className="show-comments">
        {comments?.map((comment) => (
          <div key={comment._id} className="comment-item">
            <p className="comment-author">“{comment.user}”留言：</p>

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
                {user?.userName === comment.user && (
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

      <div className="back-to">
        {path === "articles" ? (
          user?.role === "Registered User" ? (
            <p>
              <Link to="/blogs/mine">返回我的博客</Link>
            </p>
          ) : (
            <p>
              <Link to="/blogs">返回博客园地</Link>
            </p>
          )
        ) : (
          <p>
            <Link to="/news-list">返回</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default ArticleDetail;
