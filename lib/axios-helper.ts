import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
const Qs = require('qs');

const pendingRequest = new Map(); // 在执行中的请求

/**
 * 根据当前请求的信息，生成请求 Key
 */
const generateReqKey = (config: AxiosRequestConfig) => {
  const { method, url, params, data } = config;
  return [method, url, Qs.stringify(params), Qs.stringify(data)].join("&");
};

/**
 * 把当前请求信息添加到 pendingRequest，value为cancel函数
 */
const addPendingRequest = (config: AxiosRequestConfig) => {
  const requestKey = generateReqKey(config);

  config.cancelToken =
    config.cancelToken ||
    new axios.CancelToken(cancel => {
      if (!pendingRequest.has(requestKey)) {
        pendingRequest.set(requestKey, cancel);
      }
    });
};

/**
 * 取消重复的请求，并从pendingRequest中移除
 */
const removePendingRequest = (config: AxiosRequestConfig) => {
  const requestKey = generateReqKey(config);

  if (pendingRequest.has(requestKey)) {
    const cancelToken = pendingRequest.get(requestKey);
    cancelToken(requestKey);
    pendingRequest.delete(requestKey);
  }
};

export const cancelHelper = (axios: AxiosInstance) => {
  // 设置请求拦截器 （先进后出）
  axios.interceptors.request.use(
    config => {
      removePendingRequest(config); // 检查是否存在重复请求，若存在则取消已发的请求
      addPendingRequest(config); // 把当前请求信息添加到pendingRequest对象中

      return config;
    },
    error => Promise.reject(error)
  );

  // 设置响应拦截器
  axios.interceptors.response.use(
    response => {
      removePendingRequest(response.config); // 从pendingRequest对象中移除请求

      return response;
    },
    error => {
      if (error.config) {
        removePendingRequest(error.config); // 从pendingRequest对象中移除请求
      }

      return Promise.reject(error);
    }
  );
};

export default { cancelHelper };
