import React from "react";
import ReactPaginate from "react-paginate";
import styles from "../styles/productitem.module.css";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (selectedPage: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className={styles.pagination}>
      <ReactPaginate
        previousLabel="‹"
        nextLabel="›"
        breakLabel="..."
        pageCount={totalPages}
        forcePage={currentPage - 1}
        marginPagesDisplayed={1}
        pageRangeDisplayed={5}
        onPageChange={(selected) => onPageChange(selected.selected + 1)}
        containerClassName={styles.pagination}
        pageClassName={styles.pageItem}
        pageLinkClassName={styles.pageLink}
        previousClassName={styles.pageItem}
        previousLinkClassName={styles.pageLink}
        nextClassName={styles.pageItem}
        nextLinkClassName={styles.pageLink}
        breakClassName={styles.pageItem}
        breakLinkClassName={styles.pageLink}
        activeClassName={styles.printer}
        disabledClassName={styles.disabled}
      />
    </div>
  );
};

export default Pagination;