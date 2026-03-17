import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export const useData = (config, onError) => {
  const [data, setData] = useState(null);
  const [dataLoading, setLoading] = useState(true);
  const [dataError, setError] = useState(null);

  const getAuthHeaders = (isFormData = false) => {
    const token = localStorage.getItem("token");
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    if (!isFormData) headers["Content-Type"] = "application/json";
    return headers;
  };

  const handleAxiosError = (err) => {
    return {
      status: err.response?.status || (err.request ? "Network Error" : "Client Error"),
      message: err.response?.data?.message || err.message || "Error desconocido",
      errors: err.response?.data?.errors || null
    };
  };

  const isExpectedPasteLookupError = (baseUrl, status) => {
    const isPasteLookup = baseUrl?.includes("/pastes/");
    return isPasteLookup && [403, 404, 500].includes(status);
  };

  // Carga inicial ligada al `config` del contexto.
  // En lookup de pastes, algunos estados son esperados y no deben disparar error global.
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
      if (!isExpectedPasteLookupError(config.baseUrl, error.status) && onError) onError(error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [config?.baseUrl, config?.params, onError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Wrapper único para peticiones CRUD.
  // Usa objeto de opciones para mantener llamadas claras y evitar errores por orden de argumentos.
  const requestWrapper = async (method, endpoint, {
    payload = null,
    refresh = false,
    extraHeaders = {},
    silent = false,
  } = {}) => {
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
    getData: (url, paramsOrOptions, refresh = true, h = {}, silent = false) => {
      const isOptionsObject =
        paramsOrOptions &&
        typeof paramsOrOptions === "object" &&
        !Array.isArray(paramsOrOptions) &&
        ("params" in paramsOrOptions || "refresh" in paramsOrOptions || "headers" in paramsOrOptions || "silent" in paramsOrOptions);

      if (isOptionsObject) {
        const {
          params = null,
          refresh: optionsRefresh = true,
          headers = {},
          silent: optionsSilent = false,
        } = paramsOrOptions;

        return requestWrapper("get", url, {
          payload: params,
          refresh: optionsRefresh,
          extraHeaders: headers,
          silent: optionsSilent,
        });
      }

      return requestWrapper("get", url, {
        payload: paramsOrOptions,
        refresh,
        extraHeaders: h,
        silent,
      });
    },
    postData: (url, body, refresh = true, silent = false) => requestWrapper("post", url, {
      payload: body,
      refresh,
      silent,
    }),
    putData: (url, body, refresh = true, silent = false) => requestWrapper("put", url, {
      payload: body,
      refresh,
      silent,
    }),
    deleteData: (url, refresh = true, silent = false) => requestWrapper("delete", url, {
      refresh,
      silent,
    }),
  };
};