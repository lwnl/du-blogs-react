import { useState } from "react";
import "./BannedBooks.scss";

const BannedBooks = () => {
  const [expanded, setExpanded] = useState(false);
  const handleToggle = () => setExpanded(!expanded);

  return (
    <div className="BannedBooks">
      <ul>
        <li className="book-item">
          <div className="book-cover">
            <div>
              <img
                src="https://storage.googleapis.com/daniel-jansen7879-bucket-1/projects/my-blog/images/in-books/Mao_Ze_Dong_Xian_Wei_Ren_Zhi_De_Gu_Shi.jpg"
                alt="毛泽东鲜为人知的故事"
              />
            </div>
            <p className="book-intro flex-column">
              <span className="book-name">毛泽东鲜为人知的故事</span>
              <span>文件格式：PDF</span>
              <a href="">
                <span>下载</span>
              </a>
            </p>
          </div>
          <div className="book-info flex-column">
            <div className="book-review">
              <div className="book-stars">
                <img
                  src="https://storage.googleapis.com/daniel-jansen7879-bucket-1/projects/my-blog/images/in-books/star_null.gif"
                  alt="star-null"
                />
                <img
                  src="https://storage.googleapis.com/daniel-jansen7879-bucket-1/projects/my-blog/images/in-books/star_null.gif"
                  alt="star-null"
                />
                <img
                  src="https://storage.googleapis.com/daniel-jansen7879-bucket-1/projects/my-blog/images/in-books/star_null.gif"
                  alt="star-null"
                />
                <img
                  src="https://storage.googleapis.com/daniel-jansen7879-bucket-1/projects/my-blog/images/in-books/star_null.gif"
                  alt="star-null"
                />
                <img
                  src="https://storage.googleapis.com/daniel-jansen7879-bucket-1/projects/my-blog/images/in-books/star_null.gif"
                  alt="star-null"
                />
              </div>
              <p>
                <span>10 </span>分
              </p>
              <p>
                <span>65 </span>人评价
              </p>
            </div>

            <article className="flex-column">
              <div
                className={expanded ? "book-summary expanded" : "book-summary"}
              >
                《毛泽东：鲜为人知的故事》（英语：MAO：The Unknown
                Story）是张戎及其丈夫乔·哈利戴合著的一本毛泽东传记，耗时约10年完成。全书五十八章，中文版700页，资料来源占82页。张戎夫妇为完成此书，访问过数百名毛的亲友、与毛共事、交往的中外知情人、见证者及各国政要，包括六名总统、六名总理、四名外交部长、十三名前各国共产党领袖。这些人物中，有美国前国务卿基辛格、美国前总统福特、英国前首相希思、达赖喇嘛、斯大林与赫鲁晓夫的翻译、张学良、蒋经国、陈立夫等。访问毛身边工作过的人员达十八人以上。毛的主要同事和亲属和身边工作人员也几乎都访问过。同时，深入俄罗斯、阿尔巴尼亚、东德、美国、英国、梵蒂冈等二十八个档案馆，取得许多闻所未闻的史料。
                <br />
                <br />
                该书英文版于2005年6月出版。ISBN
                978-0-224-07126-0，该书中文版由香港开放出版社于2006年9月6日在台湾、香港与纽约同步上市。ISBN
                978-962-7934-19-6。2021年9月，台湾麦田出版推出修订版。该书在中国大陆被禁。
              </div>
              {expanded ? (
                <button onClick={handleToggle}>收起</button>
              ) : (
                <button onClick={handleToggle}>阅读更多</button>
              )}
            </article>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default BannedBooks;
