import axios from 'axios'
import store from '@/vuex'
import { getLanguage } from '../util/common'

// 设置 POST 请求头
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'

// 设置语言
const borwserLang = getLanguage() || 'zh';
axios.defaults.headers['Accept-Language'] = borwserLang

// 表示跨域请求时是否需要使用凭证
axios.defaults.withCredentials = false

// 配置 CORS 跨域
axios.defaults.crossDomain = true

// 设置超时
axios.defaults.timeout = 5000

// 拦截器的说明
// 1、interceptor必须在请求前设置才有效。
// 2、直接为axios全局对象创建interceptor， 会导致全局的axios发出的请求或接收的响应都会被拦截到， 所以应该使用axios.create() 来创建单独的axios实例。
// 设置地址
const baseUrl = 'https://chain.pro';

// 创建axios实例
let instance = axios.create({
    baseURL: baseUrl
});

// Add a request interceptor
instance.interceptors.request.use(config => {
    if (store.state.token) {
        config.headers.Authorization = `Bearer ${store.state.token}`
    }
    return config
}, (error) => {
    store.commit('hideLoading')
    return Promise.reject(error)
})

// Add a response interceptor
instance.interceptors.response.use(response => {
    return response.data
}, error => {
    store.commit('hideLoading')
    return Promise.reject(error)
});

export default instance
