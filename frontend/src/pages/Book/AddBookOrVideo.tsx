import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuthCheck } from "../../hooks/useAuthCheck";
import "./AddBookOrVideo.scss";
import Swal from "sweetalert2";

type AddBookOrVideoProps = {
  path: "banned-books" | "videos";
};

const AddBookOrVideo = ({ path }: AddBookOrVideoProps) => {
  const { HOST } = useAuthCheck();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(
    path === "banned-books"
      ? {
          order: null,
          bookName: "",
          coverLink: "",
          format: "",
          downloadLink: "",
          summary: "",
        }
      : {
          title: "",
          coverLink: "",
          downloadLink: "",
          keywords: "",
          category: "",
        }
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 构造请求 payload
    let payload: any = { ...formData };

    if (path === "videos" && formData.keywords) {
      // 在提交时把 string 转成 string[]
      payload.keywords = formData.keywords
        .trim()
        .split(/[\s\u3000]+/)
        .filter(Boolean);
    }

    try {
      await axios.post(`${HOST}/api/${path}/add`, payload, {
        withCredentials: true,
      });
      // 使用 Swal 弹窗代替 alert
      Swal.fire({
        icon: "success",
        title: "添加成功",
        text: "✅ 成功添加新条目！",
        confirmButtonText: "确定",
      }).then(() => {
        navigate(`/${path}`); // 点击确认后返回列表
      });
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "❌ 添加新条目失败";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="AddBookOrVideo">
      <h3>添加新条目</h3>
      <form onSubmit={handleSubmit} className="form">
        <label>
          标题 / 书名：
          <input
            type="text"
            name={path === "banned-books" ? "bookName" : "title"}
            value={path === "banned-books" ? formData.bookName : formData.title}
            onChange={handleChange}
            required
          />
        </label>

        {path === "videos" && (
          <label>
            关键词：
            <input
              type="text"
              name="keywords"
              value={formData.keywords}
              onChange={handleChange}
            />
          </label>
        )}

        {path === "videos" && (
          <label>
            类别：
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
            />
          </label>
        )}

        <label>
          封面链接：
          <input
            type="text"
            name="coverLink"
            value={formData.coverLink}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          下载 / 播放链接：
          <input
            type="text"
            name="downloadLink"
            value={formData.downloadLink}
            onChange={handleChange}
            required
          />
        </label>

        {path === "banned-books" && (
          <label>
            禁书格式：
            <input
              type="text"
              name="format"
              value={formData.format}
              onChange={handleChange}
              required
            />
          </label>
        )}

        <label className="summary">
          {path === "banned-books" && (
            <>
              简介：
              <textarea
                name="summary"
                rows={6}
                value={formData.summary}
                onChange={handleChange}
                required
              ></textarea>
            </>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "提交中..." : "提交"}
          </button>
        </label>

        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default AddBookOrVideo;
