import Vue from 'vue'
import App from './App.vue'
import router from './router'
// import './plugins/element.js'
import './assets/css/global.css'
// 导入字体图标库
// import './assets/fonts/iconfont.css'
// 引入失败 不知道为什么
// import './assets/fonts/iconfont.css'
// 导入 vue-table-tree-grid
import TreeTable from 'vue-table-with-tree-grid'
// 导入富文本编辑器组件
import VueQuillEditor from 'vue-quill-editor'

import NProgress from 'nprogress'

import axios from 'axios'
// 配置请求路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(config => {
    config.headers.Authorization = window.sessionStorage.getItem('token')
        // 第一次发的是登录请求 还没有 token字符串 所以Authorization为 null
        // console.log(config)
        // 在最后必须 return config
    NProgress.start()
    return config
})
axios.interceptors.response.use(config => {
    NProgress.done()
    return config
})
Vue.prototype.$http = axios
Vue.config.productionTip = false
Vue.component('tree-table', TreeTable)
    // 使用
Vue.use(VueQuillEditor)

// 创建一个时间过滤器
Vue.filter('dateFormat', function(val) {
    const dt = new Date(val)
    const y = dt.getFullYear()
    const m = (dt.getMonth() + 1 + '').padStart(2, '0')
    const d = (dt.getDate() + '').padStart(2, '0')
    const hh = (dt.getHours() + '').padStart(2, '0')
    const mm = (dt.getMinutes() + '').padStart(2, '0')
    const ss = (dt.getSeconds() + '').padStart(2, '0')
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')
