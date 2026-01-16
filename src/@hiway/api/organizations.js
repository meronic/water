import request from '@/utils/request'
import { isUseAPI } from '@hiway/utils/check'
import members from './mock/members.json'

const contextPath = import.meta.env.VITE_HIWAY_API_URL

// 조직 구성원 정보 가져오기
export function getUserList(retrieveData) {    
  const params = { company: '', bsns_cd: '', dept_cd: '', user_id: '', user_nm: '', asgn_shrt_nm: '', asgn_cd: '' }
  if (retrieveData.company) params.company = retrieveData.company
  if (retrieveData.dept_cd) params.dept_cd = retrieveData.dept_cd
  if (retrieveData.asgn_cd) params.dept_cd = retrieveData.asgn_cd
  if (retrieveData.kor_nm) params.user_nm = retrieveData.kor_nm
  if (retrieveData.user_id) params.user_id = retrieveData.user_id
  if (retrieveData.bsns_cd) params.bsns_cd = retrieveData.bsns_cd
  if (retrieveData.asgn_shrt_nm) params.asgn_shrt_nm = retrieveData.asgn_shrt_nm
  if ((!params.company) && (!params.dept_cd) && (!params.user_nm) && (!params.user_id) && (!params.bsns_cd)) {
    return
  }
    
  if(isUseAPI()) {
    return request({
      url: `${contextPath}/members`,
      method: 'get',
      meta: { apiVersion: '2.0.0' },
      params,
    })    
  }

  return new Promise(resolve => {
    resolve(members)
  })
}
