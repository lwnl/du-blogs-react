import { useNavigate } from "react-router-dom";
import { useAuthCheck } from "../../hooks/useAuthCheck";
import { EditorContent } from "@tiptap/react";
import EditorToolbar from "../../components/EditorToolbar";
import "prosemirror-view/style/prosemirror.css";
import "../Blog/AddArticle.scss";
import { useArticleEditor } from "../../hooks/useArticleEditor";

const AddNews = () => {
  const { authenticated, isLoading: authLoading, HOST, user } = useAuthCheck();
  const navigate = useNavigate();

  const {
    title,
    setTitle,
    feedback,
    editor,
    setLink,
    addImage,
    handleSubmit,
    isSubmitting,
  } = useArticleEditor({
    HOST,
    type: "new",
    navigate,
    path: 'news-list'
  });


  if (authLoading) return <div className="loading">检测权限...</div>;
  if (!authenticated || authenticated && user?.role !== "Administrator") {
    navigate("/users/login");
    return null;
  }

  return (
    <form className="NewArticle" onSubmit={handleSubmit}>
      <h4>添加新闻</h4>
      <input
        type="text"
        placeholder="标题"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        disabled={isSubmitting}
      />

      <div className="editor">
        <EditorToolbar editor={editor} setLink={setLink} addImage={addImage} />
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

export default AddNews;
