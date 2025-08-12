// src/pages/Blog.tsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { IArticle } from "./MyBlogs";
import { useAuthCheck } from "../hooks/useAuthCheck";
import './Blog.scss'

const Blog = () => {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<IArticle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const {
    HOST,
    user,
    authenticated,
    message,
    isLoading,
    isError,
    refetchAuth,
  } = useAuthCheck();

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    axios
      .get(`${HOST}/articles/${id}`)
      .then((res) => {
        setBlog(res.data.blog);
        setError(null);
      })
      .catch((err) => {
        setError(err.response?.data?.error || "加载文章失败");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>加载中...</div>;
  if (error) return <div className="blogError">错误: {error}</div>;
  if (!blog) return <div>文章不存在</div>;

  return <div className="Blog">
    <h5>{blog.title}</h5>
    <p><strong>作者：</strong> {blog.author}</p>
    <p><strong>更新时间：</strong> {blog.updatedAt}</p>
    {/* 将 blog.content 里的 HTML 字符串直接渲染成真正的 HTML 结构 */}
    <article dangerouslySetInnerHTML={{__html: blog.content}}></article>
    <p>
      <Link to='/my-blogs'>返回博客园地</Link>
    </p>
  </div>;
};

export default Blog;
