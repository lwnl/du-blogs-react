import { Link } from "react-router-dom"

const MyBlogs = () => {
  return (
    <div className="MyBlogs">
      <ul>
        <li>
          <Link to="/my-blogs/:id">第一篇文章</Link>
        </li>
      </ul>
    </div>
  )
}

export default MyBlogs