import { useState, useEffect, useCallback, useRef } from "react";
import axiosInstance from "../api/axiosInstance";

const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { immediate = true } = options;
  const paramsRef = useRef(options.params || {});

  useEffect(() => {
    paramsRef.current = options.params || {};
  }, [options.params]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: response } = await axiosInstance.get(url, { params: paramsRef.current });
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [fetchData, immediate]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};

export default useFetch;
