import { useNavigate, useParams } from "react-router-dom";
import { useAuthCheck } from "../../hooks/useAuthCheck";
import { EditorContent } from "@tiptap/react";
import EditorToolbar from "../../components/EditorToolbar";
import "prosemirror-view/style/prosemirror.css";
import "./Add_Update_Article.scss";
import { useArticleEditor } from "../../hooks/useArticleEditor";
import Swal from "sweetalert2";
import { useEffect } from "react";

type UpdateArticleProps = {
  path: "articles" | "news-list";
};

const UpdateArticle = ({ path }: UpdateArticleProps) => {
  const { id } = useParams<{ id: string }>();
  const { authenticated, isLoading: authLoading, HOST, user } = useAuthCheck();
  const navigate = useNavigate();

  const {
    title,
    setTitle,
    feedback,
    editor,
    isLoading: editorLoading,
    setLink,
    addImage,
    addVideo,
    isSubmitting,
    handleSubmit,
    noExistingArticle,
  } = useArticleEditor({
    id,
    HOST,
    type: "update",
    path,
    navigate,
  });

  useEffect(() => {
    if (noExistingArticle) {
      Swal.fire({
        title: "",
        text: "该文章不存在！",
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        if (path === "articles") {
          if (user?.role === "Registered User") {
            navigate("/articles/mine");
          } else {
            navigate("/articles");
          }
        } else {
          navigate("/news-list");
        }
      });
    }
  }, [noExistingArticle, user, navigate]);

  if (authLoading || editorLoading) return <p>检测权限...</p>;
  if (!authenticated) {
    navigate("/users/login");
    return null;
  }

  // 渲染前就 return null，避免访问不存在的数据
  if (noExistingArticle) return null;

  return (
    <form className="UpdateArticle" onSubmit={handleSubmit}>
      <h4>更新文章</h4>
      <input
        type="text"
        placeholder="标题"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <div className="editor">
        <EditorToolbar editor={editor} setLink={setLink} addImage={addImage} addVideo={addVideo}/>
        <EditorContent className="content-container" editor={editor} />
        {isSubmitting && <div className="editor-overlay">提交中...</div>}
      </div>

      {/* [更改] 添加了成功/错误样式 */}
      {feedback && (
        <p
          className={`feedback ${
            feedback.includes("✅") ? "success" : "error"
          }`}
        >
          {feedback}
        </p>
      )}

      {/* [更改] 添加了按钮容器和加载状态样式 */}
      <div className="actions">
        <button
          type="submit"
          disabled={isSubmitting}
          className={isSubmitting ? "submitting" : ""}
        >
          {/* [更改] 添加了加载动画 */}
          {isSubmitting ? (
            <>
              <span className="spinner"></span>
              提交中...
            </>
          ) : (
            "提交"
          )}
        </button>
      </div>
    </form>
  );
};

export default UpdateArticle;
