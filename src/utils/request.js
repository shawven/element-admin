import axios from 'axios'
import { MessageBox } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

// 创建一个axios实例
const service = axios.create({
  // url = base url + request url
  baseURL: process.env.VUE_APP_BASE_API,
  // baseURL: '/api',

  validateStatus: (status) => {
    return status >= 200 && status < 300
  },

  // request timeout
  timeout: 5000
})

const getErrorMessage = (error) => {
  // 详细异常 状态码 + 状态描述文档 + 系统异常信息
  let detailMessage
  if (error.response) {
    if (typeof error.response.data === 'object') {
      detailMessage = error.response.data.message ? error.response.data.message : ''
    } else {
      detailMessage = error.response.status + ' ' + error.response.statusText + '<br>' +
        error.response.data
    }
  } else {
    detailMessage = error.message
  }

  return detailMessage
}

const getParams = (obj, formData = false) => {
  if (obj) {
    if (formData) {
      const formData = new FormData()
      for (const [k, v] of Object.entries(obj)) {
        if (v !== 0 && !v) {
          continue
        }
        formData.append(k, v)
      }
      return formData
    }

    const newParams = {}
    for (const [k, v] of Object.entries(obj)) {
      if (v !== 0 && !v) {
        continue
      }
      newParams[k] = v
    }
    return newParams
  }
}

// 请求拦截器
service.interceptors.request.use(
  config => {
    if (config.data) {
      config.data = getParams(config.data, true)
    }
    if (config.params) {
      config.params = getParams(config.params)
    }

    if (store.getters.token) {
      config.headers['X-Token'] = getToken()
    }
    return config
  },
  error => {
    console.log('request error:')
    console.log(error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    if (error.response.status === 401) {
      // to re-login
      MessageBox.alert('您已退出请重新登录', '退出提示', {
        confirmButtonText: '重新登录',
        type: 'warning',
        callback: action => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        }
      })
      return Promise.reject(getErrorMessage(error))
    }

    console.log('response error:')
    console.log(error)

    if (error.message.startsWith('timeout')) {
      const matchArray = new RegExp('.*\\s{1}(\\d+)ms.*').exec(error.message)
      error = new Error('连接已超时超过' + matchArray[1] / 1000 + '秒')
    }
    return Promise.reject(getErrorMessage(error))
  }
)

export default service
