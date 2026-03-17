import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

export const useData = (config, onError) => {
  const [data, setData] = useState(null);
  const [dataLoading, setLoading] = useState(true);
  const [dataError, setError] = useState(null);

  const configString = JSON.stringify(config);

  const getAuthHeaders = (isFormData = false) => {
    const token = localStorage.getItem("token");
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    if (!isFormData) headers["Content-Type"] = "application/json";
    return headers;
  };

  const handleAxiosError = (err) => {
    const errorData = {
      status: err.response?.status || (err.request ? "Network Error" : "Client Error"),
      message: err.response?.data?.message || err.message || "Error desconocido",
      errors: err.response?.data?.errors || null
    };
    return errorData;
  };

  const fetchData = useCallback(async () => {
    if (!config?.baseUrl) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(config.baseUrl, {
        headers: getAuthHeaders(),
        params: config.params,
      });
      setData(response.data);
    } catch (err) {
      const error = handleAxiosError(err);
      const isPasteLookup = config.baseUrl.includes('/pastes/');

      if (isPasteLookup && (error.status === 403 || error.status === 404 || error.status === 500)) {
        console.log("Not in DB, assuming real-time...");
        setError(error);
      } else {
        if (onError) onError(error);
        setError(error);
      }
    } finally {
      setLoading(false);
    }
  }, [configString, onError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const requestWrapper = async (method, endpoint, payload = null, refresh = false, extraHeaders = {}, silent = false) => {
    try {
      const isFormData = payload instanceof FormData;

      const combinedHeaders = {
        ...getAuthHeaders(isFormData),
        ...extraHeaders
      };

      const axiosConfig = {
        headers: combinedHeaders
      };

      let response;
      if (method === "get") {
        response = await axios.get(endpoint, {
          ...axiosConfig,
          params: payload
        });
      } else if (method === "delete") {
        response = await axios.delete(endpoint, {
          ...axiosConfig,
          data: payload
        });
      } else {
        response = await axios[method](endpoint, payload, axiosConfig);
      }

      if (refresh) await fetchData();
      return response.data;
    } catch (err) {
      const error = handleAxiosError(err);
      if (!silent && error.status !== 422 && onError) {
        onError(error);
      }
      throw error;
    }
  };

  return {
    data, dataLoading, dataError,
    getData: (url, params, refresh = true, h = {}, silent = false) => requestWrapper("get", url, params, refresh, h, silent),
    postData: (url, body, refresh = true, silent = false) => requestWrapper("post", url, body, refresh, silent),
    putData: (url, body, refresh = true, silent = false) => requestWrapper("put", url, body, refresh, silent),
    deleteData: (url, refresh = true, silent = false) => requestWrapper("delete", url, null, refresh, silent),
  };
};