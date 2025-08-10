import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuthCheck } from "../hooks/useAuthCheck";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBold, faItalic, faLink, faImage } from "@fortawesome/free-solid-svg-icons";
import Tooltip from "@mui/material/Tooltip";

import { CustomImage } from "../f-utils/customImageExtension";

import "./NewBlog.scss";
import "prosemirror-view/style/prosemirror.css";

const NewBlog = () => {
  const { authenticated, isLoading, HOST } = useAuthCheck();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [feedback, setFeedback] = useState("");
  const [tempFiles, setTempFiles] = useState<string[]>([]);

  // 导入编辑器内容
  const savedContent = localStorage.getItem("newBlogContent") || "<p></p>";
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: true,
      }),
      CustomImage, // 用自定义的 Image 扩展
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
    const choice = window.confirm(
      "点击“确定”输入图片链接，点击“取消”选择本地图片"
    );

    if (choice) {
      // 通过链接加载图片
      const url = prompt("Enter image URL");
      if (url) {
        editor?.chain().focus().setImage({ src: url }).run();
      }
    } else {
      // 本地上传图片
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;

        // 1. 插入一个占位图片
        const placeholderId = `temp-${Date.now()}`;
        editor?.chain().focus().setImage({
          src: "",
          "data-placeholder": "上传中...",
          alt: placeholderId,
        }).run();

        const formData = new FormData();
        formData.append("image", file);

        try {
          const res = await axios.post(
            `${HOST}/articles/temp-uploads`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
              withCredentials: true,
            }
          );
          if (res.data?.tempUrl && res.data?.tempFilename) {
            // 2. 替换占位图片为真实图片
            editor?.chain().focus().updateAttributes("image", {
              src: res.data.tempUrl,
              "data-placeholder": null,
              alt: file.name,
            }).run();

            // 保存临时文件名
            setTempFiles((prev) => [...prev, res.data.tempFilename]);
          } else {
            console.error("No image URL returned from server");
          }
        } catch (error) {
          console.error("upload image error:", (error as Error).message);
        }
      };
      input.click();
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
        `${HOST}/articles/upload`,
        { title, content: editor.getHTML(), tempFiles },
        { withCredentials: true }
      );

      // 清空
      editor?.commands.setContent("");
      setTitle("");
      setTempFiles([]);
      localStorage.removeItem("newBlogContent");
      setFeedback("✅ Blog posted successfully!");

      // 跳转到主页
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      console.error("Blog post error:", error);
      setFeedback("❌ Failed to post blog.");
    }
  };

  useEffect(() => {
    if (!editor) return;

    editor.on("update", () => {
      const html = editor.getHTML();

      // 1. 保存到 localStorage
      localStorage.setItem("newBlogContent", html);

      // 2. 同步 tempFiles 数组（移除被删除的图片）
      setTempFiles((prev) => {
        const stillUsed = prev.filter(filename => html.includes(`/temp/${filename}`));
        const removed = prev.filter(filename => !html.includes(`/temp/${filename}`));

        // 可选：让后端立即删除这些临时文件
        removed.forEach(filename => {
          axios.post(`${HOST}/articles/temp-uploads/delete`, { filename }, { withCredentials: true })
            .catch(err => console.error("删除临时文件失败:", err));
        });

        return stillUsed;
      });
    });
  }, [editor, HOST]);

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