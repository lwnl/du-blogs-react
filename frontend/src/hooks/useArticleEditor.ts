// src/hooks/useArticleEditor.ts
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
import Iframe from "../extensions/Iframe";

interface useArticleEditorOptions {
  id?: string;
  onDeleted?: (id: string) => void;
  HOST: string;
  type?: "new" | "update";
  path: 'articles' | 'news-list' | 'videos';
  navigate: ReturnType<typeof useNavigate>;
}

//让编辑器具备客户自定义class
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

export const useArticleEditor = ({ id, HOST, type, navigate, path, onDeleted }: useArticleEditorOptions) => {
  // 根据类型确定localStorage的键名
  const prefix = type === "update" && id ? `draft_${id}_` : "draft_";
  const titleKey = `${prefix}title`;
  const keyWordsKey = `${prefix}keyWords`;
  const contentKey = `${prefix}content`;
  const imagesKey = `Images${id ? `_${id}` : ""}`;

  const [title, setTitle] = useState<string>(
    localStorage.getItem(titleKey) || ""
  );

  const [keyWords, setKeyWords] = useState<string>(
    localStorage.getItem(keyWordsKey) || ""
  );

  const [feedback, setFeedback] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(type === "update");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [noExistingArticle, setnoExistingArticle] = useState<boolean>(false);

  const decodeUrl = (url: string) => url.replace(/&amp;/g, "&");

  // 配置编辑器
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ paragraph: false }),
      CustomParagraph,
      Link.configure({ openOnClick: true }),
      Image,
      Heading.configure({ levels: [3, 4, 5] }),
      Iframe, // ✅ 自定义的 iframe 扩展
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
  const setLink = async () => {
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
  }

  // 新增 addVideo
  const addVideo = async () => {
    const { value: url } = await Swal.fire({
      title: "插入视频",
      input: "url",
      inputLabel: "请输入视频链接",
      inputPlaceholder: "https://",
      showCancelButton: true,
      confirmButtonText: "插入",
      cancelButtonText: "取消",
    });

    if (!url) return;

    // 直接插入 GCS 视频链接
    editor?.chain().focus().setIframe({ src: url }).run();
  }

  // 添加图片
  const addImage = async () => {
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
          `${HOST}/api/${path}/image/upload/temp`,
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
  }

  // 清理未使用的图片
  const removeUnusedImages = async (currentImages: string[]) => {
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
            .post(`${HOST}/api/${path}/image/delete`, { url }, { withCredentials: true })
            .catch((err) => console.error("图片删除失败:", url, err))
        )
      );
    }
  }

  // 清理草稿
  const clearDraft = () => {
    editor?.off("update");
    localStorage.removeItem(titleKey);
    localStorage.removeItem(keyWordsKey);
    localStorage.removeItem(contentKey);
    localStorage.removeItem(imagesKey);
  };


  // 提取当前编辑器中的图片
  const getCurrentImages = (): string[] => {
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
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
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

      //格式化关键字
      //1.	正则 [\s\u3000]+ 会匹配 连续的空白字符（包括半角空格、Tab、换行、中文全角空格）。
      //2.	split 会把这些匹配的部分 当作分隔符丢掉。
      const keyWordsArray = keyWords
        .trim()
        .split(/[\s\u3000]+/)
        .filter(Boolean);

      // 根据类型执行不同的请求
      if (type === "update" && id) {
        // 更新文章
        await axios.patch(
          `${HOST}/api/${path}/update/${id}`,
          { title, content: editor.getHTML(), keyWordsArray },
          { withCredentials: true }
        );
      } else {
        // 创建新文章
        const postPath = path === 'articles'
          ? `${HOST}/api/${path}/upload-blog`
          : `${HOST}/api/${path}/upload-news`
        await axios.post(
          postPath,
          { title, content: editor.getHTML(), keyWordsArray },
          { withCredentials: true }
        );
      }

      // 清除草稿
      clearDraft();

      // 设置成功反馈
      setFeedback(type === "update" ? "✅ 更新成功!" : "✅ 创建成功!");

      // 1.5秒后导航到我的博客页面
      setTimeout(() => {
        path === 'articles'
          ? navigate("/articles/mine")
          : navigate('/news-list')
      }, 1500);
    } catch (error) {
      console.error("操作失败:", error);
      setFeedback(type === "update" ? "❌ 更新失败" : "❌ 创建失败");
      setIsSubmitting(false);
    }
  };

  // 删除文章
  const handleDelete = (id: string) => {
    Swal.fire({
      title: "确定删除吗？",
      text: "此操作不可撤销！",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "确定",
      cancelButtonText: "取消",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`${HOST}/api/${path}/delete/${id}`, {
            withCredentials: true,
          })
          .then(() => {
            console.log("删除成功");
            clearDraft();
            // ✅ 执行外部传入的回调
            onDeleted?.(id);

            Swal.fire("已删除!", "文章已成功删除。", "success");
          })
          .catch((error) => {
            console.error("删除失败:", error);
            Swal.fire("删除失败", "请稍后重试。", "error");
          });
      }
    });
  }

  // 实时保存标题
  useEffect(() => {
    if (title.trim()) {
      localStorage.setItem(titleKey, title);
    } else {
      localStorage.removeItem(titleKey);
    }
  }, [title, titleKey]);

  // 实时保存关键字
  useEffect(() => {
    if (keyWords.trim()) {
      localStorage.setItem(keyWordsKey, keyWords);
    } else {
      localStorage.removeItem(keyWordsKey);
    }
  }, [keyWords, keyWordsKey]);

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

  // 初始化数据（仅用于更新）
  useEffect(() => {
    if (type === "update" && id && editor) {
      const hasLocalDraft =
        localStorage.getItem(titleKey) || localStorage.getItem(contentKey) || localStorage.getItem(keyWordsKey);

      if (!hasLocalDraft) {
        axios
          .get(`${HOST}/api/${path}/${id}`)
          .then((res) => {
            const { article } = res.data;
            const kwStr = (article.keyWords || []).join(" ");

            setTitle(article.title);
            setKeyWords(kwStr);
            editor?.commands.setContent(article.content);

            localStorage.setItem(titleKey, article.title);
            localStorage.setItem(keyWordsKey, kwStr);
            localStorage.setItem(contentKey, article.content);

            //初始化格式化数据
            const imgUrls = Array.from(article.content.matchAll(/<img[^>]+src="([^">]+)"/g))
              .map((m: any) => decodeUrl(m[1]));
            localStorage.setItem(imagesKey, JSON.stringify(imgUrls));
          })
          .catch((error) => {
            console.error("获取文章失败", (error as Error).message);
            if (axios.isAxiosError(error) && error.response?.status === 404) {
              setnoExistingArticle(true); // ✅ 捕获 404 时设置
            }
          })
          .finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    }
  }, [HOST, editor, id, type, contentKey, imagesKey, titleKey, keyWordsKey]);

  return {
    title,
    setTitle,
    keyWords,
    setKeyWords,
    feedback,
    editor,
    isLoading,
    setLink,
    addImage,
    addVideo,
    isSubmitting,
    handleSubmit,
    clearDraft,
    handleDelete,
    noExistingArticle
  };
};  