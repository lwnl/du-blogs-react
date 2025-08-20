import "./BannedBooks.scss";

const BannedBooks = () => {
  return (
    <div className="BannedBooks">
      <ul>
        <li>
          <div >
            <img src="https://storage.googleapis.com/daniel-jansen7879-bucket-1/projects/my-blog/images/in-books/Mao_Ze_Dong_Xian_Wei_Ren_Zhi_De_Gu_Shi.jpg" alt="毛泽东鲜为人知的故事" />
          </div>
          <div>
            <p>
              <span>毛泽东鲜为人知的故事</span>
              <span>文件格式：PDF</span>
              <span>下载</span>
            </p>

            <div>
              <p>星星</p>
              <p><span>10</span>分</p>
              <p><span>65</span>人评价</p>
            </div>

            <article>简介</article>

          </div>
        </li>
      </ul>
    </div>
  );
};

export default BannedBooks;
