import request from '@/utils/request'
import { isUseAPI } from '@hiway/utils/check'
import lang from './mock/lang.json'

const contextPath = import.meta.env.VITE_HIWAY_API_URL

export function getI18nSet(locale) {
  if(isUseAPI()) {
    return request({
      url: `${contextPath}/menulangs/${locale}`,
      method: 'get',
      meta: { useErrorMessage: false, useAuth: false, apiVersion: '2.0.0' },
    })    
  }  
  
  return new Promise(resolve => {
    resolve(lang[locale])
  })
}
