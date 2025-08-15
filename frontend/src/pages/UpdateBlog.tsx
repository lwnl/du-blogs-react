import { useNavigate, useParams } from "react-router-dom";
import { useAuthCheck } from "../hooks/useAuthCheck";
import { EditorContent } from "@tiptap/react";
import EditorToolbar from "../components/EditorToolbar";
import "prosemirror-view/style/prosemirror.css";
import "./NewBlog.scss";
import { useBlogEditor } from "../hooks/useBlogEditor";

const UpdateBlog = () => {
  const { id } = useParams<{ id: string }>();
  const { authenticated, isLoading: authLoading, HOST } = useAuthCheck();
  const navigate = useNavigate();
  
  const {
    title,
    setTitle,
    feedback,
    editor,
    isLoading: editorLoading,
    setLink,
    addImage,
    handleSubmit
  } = useBlogEditor({
    id,
    HOST,
    type: "update",
    navigate
  });

  if (authLoading || editorLoading) return <p>检测权限...</p>;
  if (!authenticated) {
    navigate("/users/login");
    return null;
  }

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
        <EditorToolbar
          editor={editor}
          setLink={setLink}
          addImage={addImage}
        />
        <EditorContent className="content-container" editor={editor} />
      </div>

      {feedback && <p className="feedback">{feedback}</p>}
      <button type="submit">提交</button>
    </form>
  );
};

export default UpdateBlog;