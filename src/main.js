import Vue from 'vue'

import Cookies from 'js-cookie'

import 'normalize.css/normalize.css' // a modern alternative to CSS resets

import Element from 'element-ui'
import './styles/element-variables.scss'

import './styles/index.scss' // global css
import './styles/user.css'

import App from './App'
import store from './store'
import router from './router'

import './icons' // icon
import './permission' // permission control
import './utils/error-log' // error log

import * as filters from './filters' // global filters

import * as utils from './utils/index'
import BaseList from './components/Base/list'

Vue.use(Element, {
  size: Cookies.get('size') || 'medium' // set element-ui default size
})

// register global utility filters
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

// 注册组件类
Vue.prototype.$utils = utils

// 注册工具类
Vue.component('base-list', BaseList)

// 注册对象深拷贝方法
/**
 * 深拷贝对象
 *
 * @param {object} obj
 * @returns {object}
 */
Vue.prototype.deepcopy = (obj) => {
  if (obj === undefined || obj == null || typeof (obj) === 'string') {
    return obj
  }
  return JSON.parse(JSON.stringify(obj))
}

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
