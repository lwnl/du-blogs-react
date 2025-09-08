import React from "react";
import "./Pagination.scss";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const maxVisiblePages = 7; // 当前页左右最多显示的页码数量
  const pages: (number | string)[] = [];

  // 总页数 <= maxVisiblePages + 2 (含首尾)，直接显示所有页码
  if (totalPages <= maxVisiblePages + 2) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // 始终显示第一页
    pages.push(1);

    let startPage = Math.max(currentPage - Math.floor(maxVisiblePages / 2), 2);
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage >= totalPages) {
      endPage = totalPages - 1;
      startPage = endPage - maxVisiblePages + 1;
    }

    if (startPage > 2) {
      pages.push("…");
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages - 1) {
      pages.push("…");
    }

    // 始终显示最后一页
    pages.push(totalPages);
  }

  return (
    <div className="pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        上一页
      </button>

      {pages.map((page, index) =>
        typeof page === "number" ? (
          <button
            key={index}
            className={currentPage === page ? "active" : ""}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ) : (
          <span key={index} className="ellipsis">
            {page}
          </span>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        下一页
      </button>
    </div>
  );
};

export default Pagination;