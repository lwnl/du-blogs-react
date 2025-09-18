// src/hooks/useBlogEditor.ts
import { useState, useEffect, useCallback } from "react";
import { Editor, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Heading from "@tiptap/extension-heading";
import Paragraph from "@tiptap/extension-paragraph";
import { TextSelection } from "prosemirror-state";
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface UseBlogEditorOptions {
  id?: string;
  HOST: string;
  type: "new" | "update";
  navigate: ReturnType<typeof useNavigate>;
}

const CustomParagraph = Paragraph.extend({
  addAttributes() {
    return {
      ...(Paragraph.config as any).addAttributes?.(),
      class: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute("class"),
        renderHTML: (attributes: any) => {
          if (!attributes.class) {
            return {};
          }
          return { class: attributes.class };
        },
      },
    };
  },
});

export const useBlogEditor = ({ id, HOST, type, navigate }: UseBlogEditorOptions) => {
  // 根据类型确定localStorage的键名
  const prefix = type === "update" && id ? `draft_${id}_` : "draft_";
  const titleKey = `${prefix}title`;
  const contentKey = `${prefix}content`;
  const imagesKey = `blogImages${id ? `_${id}` : ""}`;

  const [title, setTitle] = useState<string>(
    localStorage.getItem(titleKey) || ""
  );
  const [feedback, setFeedback] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(type === "update");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [noExistingBlog, setNoExistingBlog] = useState<boolean>(false);


  const editor = useEditor({
    extensions: [
      StarterKit.configure({ paragraph: false }),
      CustomParagraph,
      Link.configure({ openOnClick: true }),
      Image,
      Heading.configure({ levels: [3, 4, 5] }),
    ],
    content: localStorage.getItem(contentKey) || "<p></p>",
    editorProps: {
      handleKeyDown(view, event) {
        if (event.key === "Enter") {
          event.preventDefault();
          const { state, dispatch } = view;
          const { schema, selection } = state;
          const position = selection.$to.pos;

          const paragraph = schema.nodes.paragraph.create();
          const tr = state.tr.insert(position, paragraph);

          const selectionNew = TextSelection.near(tr.doc.resolve(position + 1));
          tr.setSelection(selectionNew);
          dispatch(tr);

          return true;
        }
        return false;
      },
    },
  });

  // 设置链接
  const setLink = useCallback(async () => {
    const { value: url } = await Swal.fire({
      title: "插入链接",
      input: "url",
      inputLabel: "请输入链接地址",
      inputPlaceholder: "https://example.com",
      showCancelButton: true,
      confirmButtonText: "插入",
      cancelButtonText: "取消",
    });

    if (url) {
      editor
        ?.chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }
  }, [editor]);

  // 添加图片
  const addImage = useCallback(async () => {
    const { value: imageUrl, isDismissed } = await Swal.fire({
      title: "添加图片",
      input: "url",
      inputLabel: "请输入图片链接",
      inputPlaceholder: "https://example.com/image.png",
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "插入链接图片",
      denyButtonText: "上传本地文件",
      cancelButtonText: "取消",
    });

    if (imageUrl) {
      editor?.chain().focus().setImage({ src: imageUrl }).run();
      return;
    } else if (isDismissed) {
      return;
    }

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
          `${HOST}/api/articles/image/upload/temp`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          }
        );

        if (res.data?.url) {
          const url = decodeUrl(res.data.url);
          editor?.chain().focus().setImage({ src: url }).run();
          editor?.chain().focus().setImage({ src: res.data.url }).run();

          // ✅ 只保存 GCS 上传的图片
          const gcsPrefix = "https://storage.googleapis.com/daniel-jansen7879-bucket-1/projects/free-talk/images/";
          if (res.data.url.startsWith(gcsPrefix)) {
            const storedImages = JSON.parse(localStorage.getItem(imagesKey) || "[]");
            storedImages.push(res.data.url);
            localStorage.setItem(imagesKey, JSON.stringify(storedImages));
          }
        }
      } catch (error) {
        console.error("upload image error:", (error as Error).message);
      }
    };
    input.click();
  }, [HOST, editor, imagesKey]);

  // 清理未使用的图片
  const removeUnusedImages = useCallback(
    async (currentImages: string[]) => {
      const storedImages: string[] = JSON.parse(localStorage.getItem(imagesKey) || "[]");
      const gcsPrefix = "https://storage.googleapis.com/daniel-jansen7879-bucket-1/projects/free-talk/images/";

      const removedImages = storedImages.filter(
        (url) => url.startsWith(gcsPrefix) && !currentImages.includes(url)
      );

      console.log('被删除的图片为：', removedImages)

      if (removedImages.length > 0) {
        await Promise.all(
          removedImages.map((url) =>
            axios
              .post(`${HOST}/api/articles/image/delete`, { url }, { withCredentials: true })
              .catch((err) => console.error("图片删除失败:", url, err))
          )
        );
      }
    },
    [HOST, imagesKey]
  );

  // 清理草稿
  const clearDraft = useCallback(() => {
    editor?.off("update");
    localStorage.removeItem(titleKey);
    localStorage.removeItem(contentKey);
    localStorage.removeItem(imagesKey);
  }, [contentKey, imagesKey, titleKey, editor]);

  /**
  * 根据文章ID清理localStorage草稿
  * 用于删除文章时调用
  */
  const clearDraftById = useCallback((articleId: string) => {
    localStorage.removeItem(`draft_${articleId}_title`);
    localStorage.removeItem(`draft_${articleId}_content`);
    localStorage.removeItem(`blogImages_${articleId}`);
  }, []);

  // 提取当前编辑器中的图片
  const getCurrentImages = useCallback((): string[] => {
    const html = editor?.getHTML() || "";
    const imageRegex = /<img[^>]+src="([^">]+)"/g;
    const images: string[] = [];
    let match;

    while ((match = imageRegex.exec(html)) !== null) {
      // decode HTML 实体
      const url = match[1].replace(/&amp;/g, "&");
      images.push(url);
    }

    return images;
  }, [editor]);

  // 处理表单提交
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    if (isSubmitting) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    setIsSubmitting(true);

    if (!title.trim() || editor?.isEmpty) {
      setFeedback("请填写所有字段！");
      setIsSubmitting(false);
      return;
    }



    try {
      // 清理未使用的图片
      const currentImages = getCurrentImages();
      await removeUnusedImages(currentImages);
      // 根据类型执行不同的请求
      if (type === "update" && id) {
        // 更新博客
        await axios.patch(
          `${HOST}/api/articles/update/${id}`,
          { title, content: editor.getHTML() },
          { withCredentials: true }
        );
      } else {
        // 创建新博客
        await axios.post(
          `${HOST}/api/articles/upload-blog`,
          { title, content: editor.getHTML() },
          { withCredentials: true }
        );
      }

      // 清除草稿
      if (type === "update" && id) {
        clearDraftById(id);
      } else {
        clearDraft();
      }

      // 设置成功反馈
      setFeedback(type === "update" ? "✅ 更新成功!" : "✅ 创建成功!");

      // 1.5秒后导航到我的博客页面
      setTimeout(() => navigate("/blogs/mine"), 1500);
    } catch (error) {
      console.error("操作失败:", error);
      setFeedback(type === "update" ? "❌ 更新失败" : "❌ 创建失败");
      setIsSubmitting(false);
    }
  }, [
    title,
    editor,
    type,
    id,
    HOST,
    getCurrentImages,
    removeUnusedImages,
    clearDraft,
    navigate,
    isSubmitting,
    imagesKey
  ]);

  // 实时保存标题
  useEffect(() => {
    localStorage.setItem(titleKey, title);
  }, [title, titleKey]);

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

  const decodeUrl = (url: string) => url.replace(/&amp;/g, "&");

  // 初始化数据（仅用于更新博客）
  useEffect(() => {
    if (type === "update" && id && editor) {
      const hasLocalDraft =
        localStorage.getItem(titleKey) || localStorage.getItem(contentKey);

      if (!hasLocalDraft) {
        axios
          .get(`${HOST}/api/articles/${id}`)
          .then((res) => {
            const { blog } = res.data;
            console.log('blog is', blog)
            setTitle(blog.title);
            editor?.commands.setContent(blog.content);
            localStorage.setItem(titleKey, blog.title);
            localStorage.setItem(contentKey, blog.content);

            //初始化格式化数据
            const imgUrls = Array.from(blog.content.matchAll(/<img[^>]+src="([^">]+)"/g))
              .map((m: any) => decodeUrl(m[1]));
            localStorage.setItem(imagesKey, JSON.stringify(imgUrls));
          })
          .catch((error) => {
            console.error("获取博客失败", (error as Error).message);
            if (axios.isAxiosError(error) && error.response?.status === 404) {
              setNoExistingBlog(true); // ✅ 捕获 404 时设置
            }
          })
          .finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    }
  }, [HOST, editor, id, type, contentKey, imagesKey, titleKey]);

  return {
    title,
    setTitle,
    feedback,
    editor,
    isLoading,
    setLink,
    addImage,
    isSubmitting,
    handleSubmit,
    clearDraft,
    clearDraftById,
    noExistingBlog
  };
};