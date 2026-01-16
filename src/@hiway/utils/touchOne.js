// import EventBus from '@hiway/utils/eventBus'
import { setToken } from '@hiway/utils/token'
import { touchOneLoginSso } from '@hiway/api/login'
import { useRouter } from 'vue-router'
import EventHandler from '@hiway/utils/eventHandler'

const router = useRouter()

const cbGetReturnValInTouchOne = function (userSpec, retVal) {
  retVal = decodeURIComponent(retVal)
  userSpec = decodeURIComponent(userSpec)
  const userSpecObj = JSON.parse(userSpec)
  console.log(userSpecObj)
  if (userSpecObj.type === 'userInfo') {
    const returnVal = JSON.parse(retVal)
    touchOneLoginSso(window.btoa(returnVal.UserId))
      .then(response => {
        setToken(response.headers['x-auth-token'])
        EventHandler.emit('touchOneLogin')
      })
      .catch(() => {
        router.push('/forbidden')
      })
  } else if (userSpecObj.type === 'barcode') {
    EventHandler.emit('barcode', retVal)
  } else if (userSpecObj.type === 'camera') {
    let fileUploadUserSpec = {
      type: 'fileUpload',
      subType: 'camera',
    }
    fileUploadUserSpec = JSON.stringify(fileUploadUserSpec)
    touchOneObj.executeFileUpload(
      'cbGetReturnValInTouchOne',
      fileUploadUserSpec,
      `{ "0": "${retVal}" }`,
      `${import.meta.env.uploadUrl}/ashist/savepicture`,
      'True',
    )
  } else if (userSpecObj.type === 'fileUpload') {
    if (userSpecObj.subType === 'camera') {
      EventHandler.emit('imageUpload', retVal)
    }
  }
}

export default cbGetReturnValInTouchOne
