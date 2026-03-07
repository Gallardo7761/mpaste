import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

export const useData = (config, onError) => {
  const [data, setData] = useState(null);
  const [dataLoading, setLoading] = useState(true);
  const [dataError, setError] = useState(null);
  const configRef = useRef();

  useEffect(() => {
    if (config?.baseUrl) {
      configRef.current = config;
    }
  }, [config]);

  const getAuthHeaders = (isFormData = false) => {
    const token = localStorage.getItem("token");

    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    return headers;
  };

  const handleAxiosError = (err) => {
    if (err.response && err.response.data) {
      const data = err.response.data;

      if (data.status === 422 && data.errors) {
        return {
          status: 422,
          errors: data.errors,
          path: data.path ?? null,
          timestamp: data.timestamp ?? null,
        };
      }

      return {
        status: data.status ?? err.response.status,
        error: data.error ?? null,
        message: data.message ?? err.response.statusText ?? "Error desconocido",
        path: data.path ?? null,
        timestamp: data.timestamp ?? null,
      };
    }

    if (err.request) {
      return {
        status: null,
        error: "Network Error",
        message: "No se pudo conectar al servidor",
        path: null,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      status: null,
      error: "Client Error",
      message: err.message || "Error desconocido",
      path: null,
      timestamp: new Date().toISOString(),
    };
  };

  const fetchData = useCallback(async () => {
    const current = configRef.current;
    if (!current?.baseUrl) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(current.baseUrl, {
        headers: getAuthHeaders(),
        params: current.params,
      });
      setData(response.data);
    } catch (err) {
      const error = handleAxiosError(err);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (config?.baseUrl) fetchData();
  }, [config, fetchData]);

  const requestWrapper = async (method, endpoint, payload = null, refresh = false) => {
    try {
      const isFormData = payload instanceof FormData;
      const headers = getAuthHeaders(isFormData);
      const cfg = { headers };
      let response;

      if (method === "get") {
        if (payload) cfg.params = payload;
        response = await axios.get(endpoint, cfg);
      } else if (method === "delete") {
        if (payload) cfg.data = payload;
        response = await axios.delete(endpoint, cfg);
      } else {
        response = await axios[method](endpoint, payload, cfg);
      }

      if (refresh) await fetchData();
      return response.data;

    } catch (err) {
      const error = handleAxiosError(err);

      if (error.status !== 422 && onError) {
        onError(error);
      }

      setError(error);
      throw error;
    }
  };

  const clearError = () => setError(null);

  return {
    data,
    dataLoading,
    dataError,
    clearError,
    getData: (url, params, refresh = true) => requestWrapper("get", url, params, refresh),
    postData: (url, body, refresh = true) => requestWrapper("post", url, body, refresh),
    putData: (url, body, refresh = true) => requestWrapper("put", url, body, refresh),
    deleteData: (url, refresh = true) => requestWrapper("delete", url, null, refresh),
    deleteDataWithBody: (url, body, refresh = true) => requestWrapper("delete", url, body, refresh)
  };
};
