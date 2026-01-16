function sso() {
  try {
    if (!isSmartOne()) {
      const referrer = document.referrer
      if ((referrer.endsWith('hshi.co.kr') || referrer.endsWith('hshi.co.kr/') || referrer.indexOf('hshi.co.kr/?return') > -1) && (location.hostname.endsWith('hshi.co.kr')) && (window === window.parent)) {
        const referrer = document.referrer.split('/')

        // const protocol = referrer[0].slice(0, -1)
        const protocol = referrer[0]
        const unitsystem = referrer[2].split('.')[0]
        if (unitsystem != 'hiway' && unitsystem != 'sso') {
          // location.href = 'https://sso.hshi.co.kr/sso/ssoService.do?returnURL=' + encodeURIComponent(location.protocol + '//' + location.hostname + (location.port == 80 || location.port == '' ? '' : ':' + location.port) + '/hiway/smartsso/' + protocol + '/' + unitsystem) + '&ssosite=DOCS::HSHI'
          location.href = 'https://sso.hshi.co.kr/sso/ssoService.do?returnURL=' + encodeURIComponent(location.protocol + '//' + location.hostname + (location.port == 80 || location.port == '' ? '' : ':' + location.port) + '/#/smartsso/' + protocol + unitsystem) + '&ssosite=DOCS::HSHI'
        }
      }
    }
  } catch (error) {
    console.log(error)
  }
}
  
function isSmartOne() {
  try {
    const touchOneObj = new mfnpObj()
    if (touchOneObj.browser === 'ANDROID' || touchOneObj.browser === 'IOS') {
      return true
    }
  } catch (error) {
    console.log(error)
  }
  return false
}
  
const getWebServer = async () => {
  const response = await fetch(document.location)
  
  // 헤더 일부를 추출
  // alert(response.headers.get('Content-Type')); // application/json; charset=utf-8
  
  // 헤더 전체를 순회
  // for (let [key, value] of response.headers) {
  //  console.log(`${key} = ${value}`);
  //}
  
  const server = response.headers.get('server') // 웹서버 종류
  
  return server == 'Apache'
}
  
function ssoCheck() {
  if (location.href.endsWith('hshi.co.kr') || location.href.endsWith('hshi.co.kr/') || location.href.indexOf('hshi.co.kr/?return') > -1) {
    getWebServer().then((res) => {
      if (res && !isSmartOne()) {
        location.href = 'http://hiway.hshi.co.kr'
      }
    })
  }
}  
