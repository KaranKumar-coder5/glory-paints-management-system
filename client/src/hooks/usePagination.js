import { useState, useCallback } from "react";

const usePagination = (initialLimit = 20) => {
  const [page, setPage] = useState(1);
  const [limit] = useState(initialLimit);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const nextPage = useCallback(() => {
    setPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToPage = useCallback((p) => {
    setPage(p);
  }, []);

  const reset = useCallback(() => {
    setPage(1);
  }, []);

  const updatePagination = useCallback((paginationData) => {
    if (paginationData) {
      setTotalPages(paginationData.pages || 1);
      setTotal(paginationData.total || 0);
    }
  }, []);

  return {
    page,
    limit,
    totalPages,
    total,
    nextPage,
    prevPage,
    goToPage,
    reset,
    updatePagination,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

export default usePagination;
