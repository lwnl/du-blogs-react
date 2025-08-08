import { Link } from "react-router-dom";
import "./MyBlogs.scss";

const MyBlogs = () => {
  return (
    <div className="MyBlogs">
      <ul>
        <li>
          <h5>
            <Link to="/my-blogs/:id">第一篇文章</Link>
          </h5>
        </li>
      </ul>
    </div>
  );
};

export default MyBlogs;
