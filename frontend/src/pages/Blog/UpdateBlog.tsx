import { useNavigate, useParams } from "react-router-dom";
import { useAuthCheck } from "../../hooks/useAuthCheck";
import { EditorContent } from "@tiptap/react";
import EditorToolbar from "../../components/EditorToolbar";
import "prosemirror-view/style/prosemirror.css";
import "./NewBlog.scss";
import { useBlogEditor } from "../../hooks/useBlogEditor";
import Swal from "sweetalert2";
import { useEffect } from "react";

const UpdateBlog = () => {
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
    isSubmitting,
    handleSubmit,
    noExistingBlog,
  } = useBlogEditor({
    id,
    HOST,
    type: "update",
    navigate,
  });

  useEffect(() => {
    if (noExistingBlog) {
      Swal.fire({
        title: "",
        text: "该文章不存在！",
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        if (user?.role === "Registered User") {
          navigate("/blogs/mine");
        } else {
          navigate("/blogs");
        }
      });
    }
  }, [noExistingBlog, user, navigate]);

  if (authLoading || editorLoading) return <p>检测权限...</p>;
  if (!authenticated) {
    navigate("/users/login");
    return null;
  }

  // 渲染前就 return null，避免访问不存在的数据
  if (noExistingBlog) return null;

  return (
    <form className="NewBlog" onSubmit={handleSubmit}>
      <h4>更新博客</h4>
      <input
        type="text"
        placeholder="标题"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
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

export default UpdateBlog;
