import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuthCheck } from "../hooks/useAuthCheck";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Heading from "@tiptap/extension-heading";
import Paragraph from "@tiptap/extension-paragraph";
import { TextSelection } from "prosemirror-state";

import "prosemirror-view/style/prosemirror.css";
import "./NewBlog.scss";
import EditorToolbar from "../components/EditorToolbar";

const NewBlog = () => {
  const { authenticated, isLoading, HOST } = useAuthCheck();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState("");

  // 初始化localStorage键
  const titleKey = `draft_title`;
  const contentKey = `draft_content`;
  const imagesKey = `blogImages`;

  // 初始化时优先尝试从localStorage加载草稿
  const [title, setTitle] = useState<string>(
    localStorage.getItem(titleKey) || ""
  );

  const CustomParagraph = Paragraph.extend({
    addAttributes() {
      return {
        ...(Paragraph.config as any).addAttributes?.(),
        class: {
          default: null,
          parseHTML: (element: HTMLElement) => element.getAttribute("class"),
          renderHTML: (attributes) => {
            if (!attributes.class) {
              return {};
            }
            return { class: attributes.class };
          },
        },
      };
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ paragraph: false }),
      CustomParagraph,
      Link.configure({ openOnClick: true }),
      Image,
      Heading.configure({
        levels: [3, 4, 5], // 支持的标题级别
      }),
    ],
    content: localStorage.getItem(contentKey) || "<p></p>",
    editorProps: {
      handleKeyDown(view, event) {
        if (event.key === "Enter") {
          event.preventDefault();
          const { state, dispatch } = view;
          const { schema, selection } = state;
          const position = selection.$to.pos;

          // 插入默认无样式段落节点
          const paragraph = schema.nodes.paragraph.create();
          const tr = state.tr.insert(position, paragraph);

          // 选中插入的空段落开头
          const selectionNew = TextSelection.near(tr.doc.resolve(position + 1));
          tr.setSelection(selectionNew);
          dispatch(tr);

          return true; // 阻止默认回车行为
        }
        return false;
      },
    },
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
      const url = prompt("Enter image URL");
      if (url) {
        editor?.chain().focus().setImage({ src: url }).run();
      }
    } else {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("image", file);

        try {
          const res = await axios.post(
            `${HOST}/articles/image/upload`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
              withCredentials: true,
            }
          );
          // 将图片src设置为保存在gcs的链接地址
          if (res.data?.url) {
            editor?.chain().focus().setImage({ src: res.data.url }).run();

            // 将图片链接地址保存在localStorage里
            const storedUrl = JSON.parse(
              localStorage.getItem(imagesKey) || "[]"
            );
            storedUrl.push(res.data.url);
            localStorage.setItem(imagesKey, JSON.stringify(storedUrl));
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
      // 先提交更新
      await axios.post(
        `${HOST}/articles/upload-blog`,
        { title, content: editor.getHTML() },
        { withCredentials: true }
      );

      // 清理未使用的图片
      const currentImages = Array.from(
        editor?.getHTML().matchAll(/<img[^>]+src="([^">]+)"/g) || []
      ).map((m) => m[1]);

      const storedImages = JSON.parse(localStorage.getItem(imagesKey) || "[]");
      const removedImages = storedImages.filter(
        (url: string) => !currentImages.includes(url)
      );

      // 异步删除图片，不阻塞主流程
      if (removedImages.length > 0) {
        Promise.all(
          removedImages.map((url: string) =>
            axios
              .post(
                `${HOST}/articles/image/delete`,
                { url },
                { withCredentials: true }
              )
              .catch((err) => {
                console.error("图片删除失败:", url, err);
              })
          )
        );
      }
      // 移除监听
      editor?.off("update");
      // 清除本地存储
      [titleKey, contentKey, imagesKey].forEach((key) =>
        localStorage.removeItem(key)
      );
      editor?.commands.setContent("");
      setTitle("");
      setFeedback("✅ 更新成功!");
      setTimeout(() => navigate("/blogs/mine"), 1500);
    } catch (error) {
      console.error("Blog post error:", error);
      setFeedback("❌ Failed to post blog.");
    }
  };

  // 只在挂载时检查并初始化
  useEffect(() => {
    if (!localStorage.getItem(titleKey)) {
      localStorage.setItem(titleKey, "");
    }
    if (!localStorage.getItem(contentKey)) {
      localStorage.setItem(contentKey, "<p></p>");
    }
    if (!localStorage.getItem(imagesKey)) {
      localStorage.setItem(imagesKey, JSON.stringify([]));
    }
  }, []);

  // 实时保存标题
  useEffect(() => {
    if (!editor) return;
    localStorage.setItem(titleKey, title);
  }, [title]);

  // 实时保存内容
  useEffect(() => {
    if (!editor) return;

    const updateHandler = () => {
      const html = editor.getHTML();
      localStorage.setItem(contentKey, html);
    };

    editor.on("update", updateHandler);
    return () => {
      editor.off("update", updateHandler);
    };
  }, [editor, contentKey]);

  if (isLoading) return <p>检测权限...</p>;
  if (!authenticated) {
    navigate("/users/login");
    return null;
  }

  return (
    <>
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
    </>
  );
};

export default NewBlog;
