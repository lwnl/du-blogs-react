import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import type { IArticle } from "./Articles/MyBlogs";
import { HOST } from "../api/auth";
import "./SearchPage.scss";
import Pagination from "../components/Pagination";

interface ISearchResult {
  news: IArticle[];
  blogs: IArticle[];
  videos: any[];
  totalPages: IPage;
}

interface IPage {
  blog: number;
  news: number;
  video: number;
}

const SearchPage = () => {
  const { type, keyword } = useParams();
  const [currentPage, setCurrentPage] = useState<IPage>({
    blog: 1,
    news: 1,
    video: 1,
  });
  const [totalPages, setTotalPages] = useState<IPage>({
    blog: 1,
    news: 1,
    video: 1,
  });
  const [searchResult, setSearchResult] = useState<ISearchResult>({
    news: [],
    blogs: [],
    videos: [],
    totalPages: {
      blog: 1,
      news: 1,
      video: 1,
    },
  });

  const pageSize = 2;

  // 处理翻页
  const handlePageChange = (type: keyof IPage, pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages[type]) return;
    setCurrentPage((prev) => ({
      ...prev,
      [type]: pageNumber,
    }));
  };

  useEffect(() => {
    axios
      .get(
        `${HOST}/api/search/${type}/${keyword}?pageSize=${pageSize}&newsPageNumber=${currentPage.news}&blogPageNumber=${currentPage.blog}&videoPageNumber=${currentPage.video}`
      )
      .then((res) => {
        const result = res.data.searchResult;
        setSearchResult(result);
        // 更新 totalPages
        if (result.totalPages) {
          setTotalPages(result.totalPages);
        }
      })
      .catch((error) => console.error("获取搜索内容失败！"));
  }, [type, keyword, currentPage, pageSize, HOST]);

  return (
    <section className="search-page">
      <h4>
        关键词<span> “{keyword}” </span>搜索结果
      </h4>
      {searchResult.news.length > 0 && (
        <div className="search-result-type">
          <h5>要闻</h5>
          <ul>
            {searchResult.news.map((newsItem) => (
              <li key={newsItem._id}>
                <Link to={`/news-list/${newsItem._id}`}>{newsItem.title}</Link>
                <span>{newsItem.createdAt}</span>
              </li>
            ))}
          </ul>
          <Pagination
            currentPage={currentPage.news}
            totalPages={totalPages.news}
            onPageChange={(page) => handlePageChange("news", page)}
          />
        </div>
      )}

      {searchResult.blogs.length > 0 && (
        <div className="search-result-type">
          <h5>博客</h5>
          <ul>
            {searchResult.blogs.map((blog) => (
              <li key={blog._id}>
                <Link to={`/articles/${blog._id}`}>{blog.title}</Link>
                <span>{blog.createdAt}</span>
              </li>
            ))}
          </ul>
          <Pagination
            currentPage={currentPage.blog}
            totalPages={totalPages.blog}
            onPageChange={(page) => handlePageChange("blog", page)}
          />
        </div>
      )}

      {searchResult.videos.length > 0 && (
        <div className="search-result-type">
          <h5>视频</h5>
          <ul>
            {searchResult.videos.map((video) => (
              <li key={video._id}>
                <Link to={`/videos/${video._id}`}>{video.title}</Link>
                <span>{video.createdAt}</span>
              </li>
            ))}
          </ul>
          <Pagination
            currentPage={currentPage.video}
            totalPages={totalPages.video}
            onPageChange={(page) => handlePageChange("video", page)}
          />
        </div>
      )}
    </section>
  );
};

export default SearchPage;
