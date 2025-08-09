import { Link } from "react-router-dom";
import "./MyBlogs.scss";
import { useAuthCheck } from "../hooks/useAuthCheck";

const MyBlogs = () => {
  const { user, authenticated, message, isLoading, isError, refetchAuth } =
    useAuthCheck();

  return (
    <div className="MyBlogs">
      <ul className="blogs">
        <li>
          <h5>
            <Link to="/my-blogs/:id">第一篇文章</Link>
          </h5>
        </li>
        <li>
          <h5>
            <Link to="/my-blogs/:id">第一篇文章</Link>
          </h5>
        </li>
      </ul>

      {authenticated ? (
        <div className="add-blog">
          <Link to="/new-blog">
            <button>添加一条博客</button>
          </Link>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default MyBlogs;
