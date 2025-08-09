import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuthCheck } from "../hooks/useAuthCheck";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBold,
  faItalic,
  faLink,
  faImage,
} from "@fortawesome/free-solid-svg-icons";
import Tooltip from "@mui/material/Tooltip";

import "./NewBlog.scss";
import "prosemirror-view/style/prosemirror.css";

const NewBlog = () => {
  const { authenticated, isLoading } = useAuthCheck();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [feedback, setFeedback] = useState("");

  // 导入编辑器内容
  const savedContent = localStorage.getItem("newBlogContent") || "<p></p>";
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: true,
      }),
      Image,
    ],
    content: savedContent,
  });

  const setLink = () => {
    const url = prompt("Enter URL");
    if (url) {
      editor
        ?.chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }
  };

  const addImage = () => {
    const url = prompt("Enter image URL");
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !editor?.getHTML().trim()) {
      setFeedback("Please fill in all fields.");
      return;
    }

    try {
      await axios.post(
        "/api/blogs",
        { title, content: editor.getHTML() },
        { withCredentials: true }
      );

      editor?.commands.setContent("");
      setTitle("");
      localStorage.removeItem("newBlogContent");
      setFeedback("✅ Blog posted successfully!");
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      console.error("Blog post error:", error);
      setFeedback("❌ Failed to post blog.");
    }
  };

  useEffect(() => {
    if (!editor) return;
    editor.on("update", () => {
      localStorage.setItem("newBlogContent", editor.getHTML());
    });
  }, [editor]);

  if (isLoading) return <p>检测权限...</p>;
  if (!authenticated) {
    navigate("/users/login");
    return null;
  }

  return (
    <form className="NewBlog" onSubmit={handleSubmit}>
      <h4>创建新博客</h4>
      <input
        type="text"
        placeholder="标题"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <div className="editor">
        <div className="editor-toolbar">
          <Tooltip title="粗体">
            <FontAwesomeIcon
              icon={faBold}
              onClick={() => editor?.chain().focus().toggleBold().run()}
            />
          </Tooltip>
          <Tooltip title="斜体">
            <FontAwesomeIcon
              icon={faItalic}
              onClick={() => editor?.chain().focus().toggleItalic().run()}
            />
          </Tooltip>
          <Tooltip title="超链接">
            <FontAwesomeIcon icon={faLink} onClick={setLink} />
          </Tooltip>
          <Tooltip title="图片">
            <FontAwesomeIcon icon={faImage} onClick={addImage} />
          </Tooltip>
        </div>
        <EditorContent editor={editor} />
      </div>

      {feedback && <p className="feedback">{feedback}</p>}
      <button type="submit">提交</button>
    </form>
  );
};

export default NewBlog;
