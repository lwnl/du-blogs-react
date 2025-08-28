import { useState } from "react";
import "./UserRating.scss";

interface UserRatingProps {
  submitRating?: (score: number) => void;
  currentRating?: number | null;
}

export const starNull =
  "https://storage.googleapis.com/daniel-jansen7879-bucket-1/projects/my-blog/images/in-books/star_null.gif";
export const starOne =
  "https://storage.googleapis.com/daniel-jansen7879-bucket-1/projects/my-blog/images/in-books/star_one.gif";

const UserRating: React.FC<UserRatingProps> = ({
  submitRating,
  currentRating,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null); // hover 的索引
  const [selectedIndex, setSelectedIndex] = useState<number | null>(currentRating || null);
  const [clickedIndex, setClickedIndex] = useState<number | null>(null); // 点击动画的索引
  console.log('currentRating 字组件：', currentRating)

  const handleClick = (index: number) => {
    setSelectedIndex(index); // 永久高亮
    setClickedIndex(index); // 动画
    setTimeout(() => setClickedIndex(null), 600); // 让动画可以再次实现

    const score = index + 1; // 星星数量 = 评分
    if (submitRating) submitRating(score); // 回调父组件
  };

 

  return (
    <div className="book-stars">
      <span>{currentRating ? "您的" : "请您"}评分：</span>
      {Array(5)
        .fill(0)
        .map((_, i) => {
          // 判断是否需要高亮
          const isHighlighted =
            selectedIndex !== null
              ? i <= selectedIndex // 点击后显示
              : hoverIndex !== null
              ? i <= hoverIndex // hover 时显示
              : true; // 默认满分

          return (
            <img
              key={i}
              src={isHighlighted ? starOne : starNull}
              alt="star"
              className={clickedIndex === i ? "clicked" : ""}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
              onClick={() => {
                handleClick(i);
              }}
            />
          );
        })}
    </div>
  );
};

export default UserRating;
