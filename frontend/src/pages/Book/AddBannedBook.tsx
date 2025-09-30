import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuthCheck } from "../../hooks/useAuthCheck";
import "./AddBannedBook.scss";
import Swal from "sweetalert2";

const AddBannedBook = () => {
  const { HOST } = useAuthCheck();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    order: null,
    bookName: "",
    coverLink: "",
    format: "",
    downloadLink: "",
    summary: "",
  });

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

    try {
      await axios.post(`${HOST}/api/banned-books/add`, formData, {
        withCredentials: true,
      });
      // 使用 Swal 弹窗代替 alert
      Swal.fire({
        icon: "success",
        title: "添加成功",
        text: "✅ 新书添加成功！",
        confirmButtonText: "确定",
      }).then(() => {
        navigate("/banned-books"); // 点击确认后返回列表
      });
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "❌ 添加新书失败";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="AddBannedBook">
      <h3>添加新书</h3>
      <form onSubmit={handleSubmit} className="form">
        <label>
          书名：
          <input
            type="text"
            name="bookName"
            value={formData.bookName}
            onChange={handleChange}
            required
          />
        </label>

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
          文件格式：
          <input
            type="text"
            name="format"
            value={formData.format}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          下载链接：
          <input
            type="text"
            name="downloadLink"
            value={formData.downloadLink}
            onChange={handleChange}
            required
          />
        </label>

        <label className="summary">
          简介：
          <textarea
            name="summary"
            rows={6}
            value={formData.summary}
            onChange={handleChange}
            required
          ></textarea>
          <button type="submit" disabled={loading}>
            {loading ? "提交中..." : "提交"}
          </button>
        </label>

        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default AddBannedBook;
