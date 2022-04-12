"use strict";
exports.__esModule = true;
exports.cancelHelper = void 0;
var axios_1 = require("axios");
var Qs = require('qs');
var pendingRequest = new Map(); // 在执行中的请求
/**
 * 根据当前请求的信息，生成请求 Key
 */
var generateReqKey = function (config) {
    var method = config.method, url = config.url, params = config.params, data = config.data;
    return [method, url, Qs.stringify(params), Qs.stringify(data)].join("&");
};
/**
 * 把当前请求信息添加到 pendingRequest，value为cancel函数
 */
var addPendingRequest = function (config) {
    var requestKey = generateReqKey(config);
    config.cancelToken =
        config.cancelToken ||
            new axios_1["default"].CancelToken(function (cancel) {
                if (!pendingRequest.has(requestKey)) {
                    pendingRequest.set(requestKey, cancel);
                }
            });
};
/**
 * 取消重复的请求，并从pendingRequest中移除
 */
var removePendingRequest = function (config) {
    var requestKey = generateReqKey(config);
    if (pendingRequest.has(requestKey)) {
        var cancelToken = pendingRequest.get(requestKey);
        cancelToken(requestKey);
        pendingRequest["delete"](requestKey);
    }
};
/**
 * 自动取消重复请求帮助函数
 */
var cancelHelper = function (axios) {
    // 设置请求拦截器 （先进后出）
    axios.interceptors.request.use(function (config) {
        removePendingRequest(config); // 检查是否存在重复请求，若存在则取消已发的请求
        addPendingRequest(config); // 把当前请求信息添加到pendingRequest对象中
        return config;
    }, function (error) { return Promise.reject(error); });
    // 设置响应拦截器
    axios.interceptors.response.use(function (response) {
        removePendingRequest(response.config); // 从pendingRequest对象中移除请求
        return response;
    }, function (error) {
        if (error.config) {
            removePendingRequest(error.config); // 从pendingRequest对象中移除请求
        }
        return Promise.reject(error);
    });
};
exports.cancelHelper = cancelHelper;
exports["default"] = { cancelHelper: exports.cancelHelper };
