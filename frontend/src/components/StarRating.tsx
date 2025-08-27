import { useState } from "react";
import "./starRating.scss";

const StarRating = () => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null); // hover 的索引
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null); // 点击选中的索引
  const [clickedIndex, setClickedIndex] = useState<number | null>(null); // 点击动画的索引

  const starNull =
    "https://storage.googleapis.com/daniel-jansen7879-bucket-1/projects/my-blog/images/in-books/star_null.gif";
  const starOne =
    "https://storage.googleapis.com/daniel-jansen7879-bucket-1/projects/my-blog/images/in-books/star_one.gif";

  return (
    <div className="book-stars">
      {Array(5)
        .fill(0)
        .map((_, i) => {
          // 判断是否需要高亮
          const isHighlighted =
            hoverIndex !== null
              ? i <= hoverIndex // hover 时显示
              : selectedIndex !== null
              ? i <= selectedIndex // 点击后显示
              : false;

          return (
            <img
              key={i}
              src={isHighlighted ? starOne : starNull}
              alt="star"
              className={clickedIndex === i ? "clicked" : ""}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
              onClick={() => {
                setSelectedIndex(i); // 点击后永久高亮
                setClickedIndex(i); // 触发动画
                // 动画结束后移除 class，保证下次点击还能触发
                setTimeout(() => setClickedIndex(null), 600);
              }}
            />
          );
        })}
    </div>
  );
};

export default StarRating;