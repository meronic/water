mfnpObj = function () {
  var agent = navigator.userAgent.toLowerCase()

  if (Number(agent.indexOf('iphone')) > -1) {
    this.browser = 'IOS'
  } else if (Number(agent.indexOf('ipad')) > -1) {
    this.browser = 'IOS'
  } else if (Number(agent.indexOf('ipod')) > -1) {
    this.browser = 'IOS'
  } else if (Number(agent.indexOf('android')) > -1) {
    this.browser = 'ANDROID'
  } else if (Number(agent.indexOf('windows phone')) > -1) {
    this.browser = 'WINDOWSPHONE'
  } else {
    this.browser = 'NOT SUPPORT'
  }
}

mfnpObj.prototype = {
  executeWebHistoryClear: function (callBack, userSpec) {
    // V.5.4.8 이후 적용
    callBack = encodeURIComponent(callBack)
    userSpec = encodeURIComponent(userSpec)

    switch (this.browser.toString()) {
    case 'IOS':
      alert('mFinity does not support this OS (or Device);')
      break
    case 'ANDROID':
      window.mfinity.executeWebHistoryClear(callBack, userSpec)
      break
    case 'WINDOWSPHONE':
      alert('mFinity does not support this OS (or Device);')
      break
    default:
      alert('mFinity does not support this OS (or Device);')
      break
    }
  },
  getWebHistory: function (callBack, userSpec) {
    // V.5.4.8 이후 적용
    callBack = encodeURIComponent(callBack)
    userSpec = encodeURIComponent(userSpec)

    switch (this.browser.toString()) {
    case 'IOS':
      alert('mFinity does not support this OS (or Device);')
      break
    case 'ANDROID':
      window.mfinity.getWebHistory(callBack, userSpec)
      break
    case 'WINDOWSPHONE':
      alert('mFinity does not support this OS (or Device);')
      break
    default:
      alert('mFinity does not support this OS (or Device);')
      break
    }
  },
  setRemoveWebViewData: function (cookie, cache, history) {
    // V.5.4.8 이후 적용
    cookie = encodeURIComponent(cookie)
    cache = encodeURIComponent(cache)
    history = encodeURIComponent(history)

    switch (this.browser.toString()) {
    case 'IOS':
      alert('mFinity does not support this OS (or Device);')
      break
    case 'ANDROID':
      window.mfinity.setRemoveWebViewData(cookie, cache, history)
      break
    case 'WINDOWSPHONE':
      alert('mFinity does not support this OS (or Device);')
      break
    default:
      alert('mFinity does not support this OS (or Device);')
      break
    }
  },
  executeApplication: function (param) {
    param = encodeURIComponent(param)

    switch (this.browser.toString()) {
    case 'IOS':
      alert('mFinity does not support this OS (or Device)')
      break
    case 'ANDROID':
      window.mfinity.executeApplication(param)
      break
    case 'WINDOWSPHONE':
      alert('mFinity does not support this OS (or Device)')
      break
    default:
      alert('mFinity does not support this OS (or Device)')
      break
    }
  },

  getMenuInfo: function (callBack, userSpec, menuNo) {
    callBack = encodeURIComponent(callBack)
    userSpec = encodeURIComponent(userSpec)
    menuNo = encodeURIComponent(menuNo)

    switch (this.browser.toString()) {
    case 'IOS':
      alert('mFinity does not support this OS (or Device)')
      break
    case 'ANDROID':
      window.mfinity.getMenuInfo(callBack, userSpec, menuNo)
      break
    case 'WINDOWSPHONE':
      alert('mFinity does not support this OS (or Device)')
      break
    default:
      alert('mFinity does not support this OS (or Device)')
      break
    }
  },

  executeMenu: function (menuNo) {
    menuNo = encodeURIComponent(menuNo)

    switch (this.browser.toString()) {
    case 'IOS':
      location.href = 'mfinity://executeMenu?menuNo=' + menuNo + ''
      break
    case 'ANDROID':
      window.mfinity.executeMenu(menuNo)
      break
    default:
      alert('mFinity does not support this OS (or Device)')
      break
    }
  },

  executeMenu: function (callBack, userSpec, menuNo) {
    callBack = encodeURIComponent(callBack)
    userSpec = encodeURIComponent(userSpec)
    menuNo = encodeURIComponent(menuNo)

    switch (this.browser.toString()) {
    case 'IOS':
      location.href = 'mfinity://executeMenu?menuNo=' + menuNo
      break
    case 'ANDROID':
      window.mfinity.executeMenu(callBack, userSpec, menuNo)
      break
    case 'WINDOWSPHONE':
      alert('mFinity does not support this OS (or Device)')
      break
    default:
      alert('mFinity does not support this OS (or Device)')
      break
    }
  },

  executeMenu: function (callBack, userSpec, menuNo, isStart) {
    callBack = encodeURIComponent(callBack)
    userSpec = encodeURIComponent(userSpec)
    menuNo = encodeURIComponent(menuNo)
    isStart = encodeURIComponent(isStart)

    switch (this.browser.toString()) {
    case 'IOS':
      alert('mFinity does not support this OS (or Device)')
      break
    case 'ANDROID':
      window.mfinity.executeMenu(callBack, userSpec, menuNo, isStart)
      break
    case 'WINDOWSPHONE':
      alert('mFinity does not support this OS (or Device)')
      break
    default:
      alert('mFinity does not support this OS (or Device)')
      break
    }
  },

  getMDMInfo: function (callBack, userSpec) {
    callBack = encodeURIComponent(callBack)
    userSpec = encodeURIComponent(userSpec)

    switch (this.browser.toString()) {
    case 'IOS':
      alert('mFinity does not support this OS (or Device)')
      break
    case 'ANDROID':
      window.mfinity.getMDMInfo(callBack, userSpec)
      break
    case 'WINDOWSPHONE':
      alert('mFinity does not support this OS (or Device)')
      break
    default:
      alert('mFinity does not support this OS (or Device)')
      break
    }
  },

  getNetworkInfo: function (callBack, userSpec) {
    callBack = encodeURIComponent(callBack)
    userSpec = encodeURIComponent(userSpec)

    switch (this.browser.toString()) {
    case 'IOS':
      alert('mFinity does not support this OS (or Device)')
      break
    case 'ANDROID':
      window.mfinity.getNetworkInfo(callBack, userSpec)
      break
    case 'WINDOWSPHONE':
      alert('mFinity does not support this OS (or Device)')
      break
    default:
      alert('mFinity does not support this OS (or Device)')
      break
    }
  },

  executeOzViewer: function (callBack, userSpec, params) {
    callBack = encodeURIComponent(callBack)
    userSpec = encodeURIComponent(userSpec)
    params = encodeURIComponent(params)

    switch (this.browser.toString()) {
    case 'IOS':
      alert('mFinity does not support this OS (or Device)')
      break
    case 'ANDROID':
      window.mfinity.executeOzViewer(callBack, userSpec, params)
      break
    case 'WINDOWSPHONE':
      alert('mFinity does not support this OS (or Device)')
      break
    default:
      alert('mFinity does not support this OS (or Device)')
      break
    }
  },

  executeSecurityCamera: function (callBack, userSpec, emp_no) {
    callBack = encodeURIComponent(callBack)
    userSpec = encodeURIComponent(userSpec)
    emp_no = encodeURIComponent(emp_no)

    switch (this.browser.toString()) {
    case 'IOS':
      alert('mFinity does not support this OS (or Device)')
      break
    case 'ANDROID':
      window.mfinity.executeSecurityCamera(callBack, userSpec, emp_no)
      break
    case 'WINDOWSPHONE':
      alert('mFinity does not support this OS (or Device)')
      break
    default:
      alert('mFinity does not support this OS (or Device)')
      break
    }
  },

  executeFileDownload: function (callBack, userSpec, fileName, path) {
    callBack = encodeURIComponent(callBack)
    userSpec = encodeURIComponent(userSpec)
    fileName = encodeURIComponent(fileName)
    path = encodeURIComponent(path)

    switch (this.browser.toString()) {
    case 'IOS':
      alert('mFinity does not support this OS (or Device)')
      break
    case 'ANDROID':
      window.mfinity.executeFileDownload(callBack, userSpec, fileName, path)
      break
    case 'WINDOWSPHONE':
      alert('mFinity does not support this OS (or Device)')
      break
    default:
      alert('mFinity does not support this OS (or Device)')
      break
    }
  },

  executeScreenCaptureService: function (callBack, userSpec) {
    callBack = encodeURIComponent(callBack)
    userSpec = encodeURIComponent(userSpec)

    switch (this.browser.toString()) {
    case 'IOS':
      alert('mFinity does not support this OS (or Device)')
      break
    case 'ANDROID':
      window.mfinity.executeScreenCaptureService(callBack, userSpec)
      break
    case 'WINDOWSPHONE':
      alert('mFinity does not support this OS (or Device)')
      break
    default:
      alert('mFinity does not support this OS (or Device)')
      break
    }
  },

  executeImageEditor: function (callBack, userSpec, path, flagOrgDelete) {
    callBack = encodeURIComponent(callBack)
    userSpec = encodeURIComponent(userSpec)
    path = encodeURIComponent(path)
    org_delete = encodeURIComponent(org_delete) // true/false;

    switch (this.browser.toString()) {
    case 'IOS':
      alert('mFinity does not support this OS (or Device)')
      break
    case 'ANDROID':
      if (org_delete == 'undefined' || org_delete == '') {
        window.mfinity.executeImageEditor(callBack, userSpec, path)
      } else {
        window.mfinity.executeImageEditor(callBack, userSpec, path, org_delete)
      }
      break
    case 'WINDOWSPHONE':
      alert('mFinity does not support this OS (or Device)')
      break
    default:
      alert('mFinity does not support this OS (or Device)')
      break
    }
  },

  executeRetrieve: function (dbName, selectStmt, callBack, userSpec) {
    dbName = encodeURIComponent(dbName)
    selectStmt = encodeURIComponent(selectStmt)
    callBack = encodeURIComponent(callBack)
    userSpec = encodeURIComponent(userSpec)

    switch (this.browser.toString()) {
    case 'IOS':
      location.href =
          'mfinity://executeRetrieve?dbName=' +
          dbName +
          '&selectStmt=' +
          selectStmt +
          '&callbackFunc=' +
          callBack +
          '&userSpecific=' +
          userSpec +
          ''
      break
    case 'ANDROID':
      window.mfinity.executeRetrieve(dbName, selectStmt, callBack, userSpec)
      break
    default:
      alert('mFinity does not support this OS (or Device)')
      break
    }
  },

  executeNonQuery: function (dbName, sqlStmt, callBack, userSpec) {
    dbName = encodeURIComponent(dbName)
    sqlStmt = encodeURIComponent(sqlStmt)
    callBack = encodeURIComponent(callBack)
    userSpec = encodeURIComponent(userSpec)

    switch (this.browser.toString()) {
    case 'IOS':
      location.href =
          'mfinity://executeNonQuery?dbName=' +
          dbName +
          '&sqlStmt=' +
          sqlStmt +
          '&callbackFunc=' +
          callBack +
          '&userSpecific=' +
          userSpec +
          ''
      break
    case 'ANDROID':
      window.mfinity.executeNonQuery(dbName, sqlStmt, callBack, userSpec)
      break
    default:
      alert('mFinity does not support this OS (or Device)')
      break
    }
  },

  executeCamera: function (callBack, userSpec) {
    callBack = encodeURIComponent(callBack)
    userSpec = encodeURIComponent(userSpec)

    switch (this.browser.toString()) {
    case 'IOS':
      location.href = 'mfinity://executeCamera?callbackFunc=' + callBack + '&userSpecific=' + userSpec + ''
      break
    case 'ANDROID':
      window.mfinity.executeCamera(callBack, userSpec)
      break
    default:
      alert('mFinity does not support this OS (or Device)')
      break
    }
  },

  executeSignpad: function (callBack, userSpec) {
    callBack = encodeURIComponent(callBack)
    userSpec = encodeURIComponent(userSpec)

    switch (this.browser.toString()) {
    case 'IOS':
      location.href = 'mfinity://executeSignpad?callbackFunc=' + callBack + '&userSpecific=' + userSpec + ''
      break
    case 'ANDROID':
      window.mfinity.executeSignpad(callBack, userSpec)
      break
    default:
      alert('mFinity does not support this OS (or Device)')
      break
    }
  },

  executeBarcode: function (callBack, userSpec) {
    callBack = encodeURIComponent(callBack)
    userSpec = encodeURIComponent(userSpec)

    switch (this.browser.toString()) {
    case 'IOS':
      location.href = 'mfinity://executeBarcode?callbackFunc=' + callBack + '&userSpecific=' + userSpec + ''
      break
    case 'ANDROID':
      window.mfinity.executeBarcode(callBack, userSpec)
      break
    default:
      alert('mFinity does not support this OS (or Device)')
      break
    }
  },

  executeFileUpload: function (callBack, userSpec, fileList, upLoadPath, afterDropFlag) {
    callBack = encodeURIComponent(callBack)
    userSpec = encodeURIComponent(userSpec)
    fileList = encodeURIComponent(fileList)
    upLoadPath = encodeURIComponent(upLoadPath)
    afterDropFlag = encodeURIComponent(afterDropFlag) //업로드 후 원본파일 삭제여부[String 'true'|'false'] 지정(안드로이드에 한함)

    switch (this.browser.toString()) {
    case 'IOS':
      location.href =
          'mfinity://executeFileUpload?callbackFunc=' +
          callBack +
          '&userSpecific=' +
          userSpec +
          '&fileList=' +
          fileList +
          '&upLoadPath=' +
          upLoadPath
      break
    case 'ANDROID':
      window.mfinity.executeFileUpload(callBack, userSpec, fileList, upLoadPath, afterDropFlag)
      break
    default:
      alert('mFinity does not support this OS (or Device)')
      break
    }
  },

  executeVideoPlayer: function (streamingUrl) {
    encodeUrl = encodeURIComponent(streamingUrl)

    switch (this.browser.toString()) {
    case 'IOS':
      // location.href="mfinity://executeVideoPlayer?=streamingUrl"
      alert('mFinity does not support this OS (or Device)')
      break
    case 'ANDROID':
      window.mfinity.executeVideoPlayer(encodeUrl)
      break
    default:
      alert('mFinity does not support this OS (or Device)')
      break
    }
  },

  executeNotification: function (vibrator, beep, timer) {
    vibrator = encodeURIComponent(vibrator)
    beep = encodeURIComponent(beep)
    timer = encodeURIComponent(timer)

    switch (this.browser.toString()) {
    case 'IOS':
      location.href =
          'mfinity://executeNotification?useVibrator=' + vibrator + '&useBeep=' + beep + '&time=' + timer + ''
      break
    case 'ANDROID':
      window.mfinity.executeNotification(vibrator, beep, timer)
      break
    default:
      alert('mFinity does not support this OS (or Device)')
      break
    }
  },

  executeDatagate: function (callBack, userSpec, dbConfigKey, sprocName, args) {
    callBack = encodeURIComponent(callBack)
    userSpec = encodeURIComponent(userSpec)
    dbConfigKey = encodeURIComponent(dbConfigKey)
    sprocName = encodeURIComponent(sprocName)
    args = encodeURIComponent(args)

    switch (this.browser.toString()) {
    case 'IOS':
      location.href =
          'mfinity://executeDatagate?callbackFunc=' +
          callBack +
          '&userSpecific=' +
          userSpec +
          '&dbConfigKey=' +
          dbConfigKey +
          '&sprocName=' +
          sprocName +
          '&args=' +
          args +
          ''
      break
    case 'ANDROID':
      window.mfinity.executeDatagate(callBack, userSpec, dbConfigKey, sprocName, args)
      break
    default:
      alert('mFinity does not support this OS (or Device)')
      break
    }
  },

  executePush: function (callBack, userSpec, msg, userList) {
    callBack = encodeURIComponent(callBack)
    userSpec = encodeURIComponent(userSpec)
    msg = encodeURIComponent(msg)
    userList = encodeURIComponent(userList)

    switch (this.browser.toString()) {
    case 'IOS':
      location.href =
          'mfinity://executePush?callbackFunc=' +
          callBack +
          '&userSpecific=' +
          userSpec +
          '&msg=' +
          msg +
          '&userList=' +
          userList +
          ''
      break
    case 'ANDROID':
      window.mfinity.executePush(callBack, userSpec, msg, userList)
      break
    default:
      alert('mFinity does not support this OS (or Device)')
      break
    }
  },

  executeBackKeyEvent: function (callBack, userSpec) {
    callBack = encodeURIComponent(callBack)
    userSpec = encodeURIComponent(userSpec)

    switch (this.browser.toString()) {
    case 'IOS':
      location.href = 'mfinity://executeBackKeyEvent?callbackFunc=' + callBack + '&userSpecific=' + userSpec + ''
      break
    case 'ANDROID':
      window.mfinity.executeBackKeyEvent(callBack, userSpec)
      break
    default:
      alert('mFinity does not support this OS (or Device)')
      break
    }
  },

  executeSms: function (callBack, userSpec, msg, userList) {
    callBack = encodeURIComponent(callBack)
    userSpec = encodeURIComponent(userSpec)
    msg = encodeURIComponent(msg)
    userList = encodeURIComponent(userList)

    switch (this.browser.toString()) {
    case 'IOS':
      location.href =
          'mfinity://executeSms?callbackFunc=' +
          callBack +
          '&userSpecific=' +
          userSpec +
          '&msg=' +
          msg +
          '&userList=' +
          userList +
          ''
      break
    case 'ANDROID':
      window.mfinity.executeSms(callBack, userSpec, msg, userList)
      break
    default:
      alert('mFinity does not support this OS (or Device)')
      break
    }
  },

  executeExitWebBrowser: function () {
    switch (this.browser.toString()) {
    case 'IOS':
      location.href = 'mfinity://executeExitWebBrowser'
      break
    case 'ANDROID':
      window.mfinity.executeExitWebBrowser()
      break
    default:
      alert('mFinity does not support this OS (or Device)')
      break
    }
  },

  executeProgressDialogStart: function (callBack, title, msg) {
    callBack = encodeURIComponent(callBack)
    title = encodeURIComponent(title)
    msg = encodeURIComponent(msg)

    switch (this.browser.toString()) {
    case 'IOS':
      location.href =
          'mfinity://executeProgressDialogStart?callbackFunc=' + callBack + '&title=' + title + '&msg=' + msg + ''
      break
    case 'ANDROID':
      window.mfinity.executeProgressDialogStart(callBack, title, msg)
      break
    default:
      alert('mFinity does not support this OS (or Device)')
      break
    }
  },

  executeProgressDialogStop: function (callBack) {
    callBack = encodeURIComponent(callBack)

    switch (this.browser.toString()) {
    case 'IOS':
      location.href = 'mfinity://executeProgressDialogStop?callbackFunc=' + callBack + ''
      break
    case 'ANDROID':
      window.mfinity.executeProgressDialogStop(callBack)
      break
    default:
      alert('mFinity does not support this OS (or Device)')
      break
    }
  },

  executeMediaRecorder: function (callBack, userSpec) {
    callBack = encodeURIComponent(callBack)
    userSpec = encodeURIComponent(userSpec)

    switch (this.browser.toString()) {
    case 'IOS':
      alert('mFinity does not support this OS (or Device)')
      break
    case 'ANDROID':
      window.mfinity.executeMediaRecorder(callBack, userSpec)
      break
    default:
      alert('mFinity does not support this OS (or Device)')
      break
    }
  },

  executeExitMediaRecorder: function (callBack, userSpec) {
    callBack = encodeURIComponent(callBack)
    userSpec = encodeURIComponent(userSpec)

    switch (this.browser.toString()) {
    case 'IOS':
      alert('mFinity does not support this OS (or Device)')
      break
    case 'ANDROID':
      window.mfinity.executeExitMediaRecorder(callBack, userSpec)
      break
    default:
      alert('mFinity does not support this OS (or Device)')
      break
    }
  },

  getGpsLocation: function (callBack, userSpec) {
    callBack = encodeURIComponent(callBack)
    userSpec = encodeURIComponent(userSpec)

    switch (this.browser.toString()) {
    case 'IOS':
      location.href = 'mfinity://getGpsLocation?callbackFunc=' + callBack + '&userSpecific=' + userSpec + ''
      break
    case 'ANDROID':
      window.mfinity.getGpsLocation(callBack, userSpec)
      break
    default:
      alert('mFinity does not support this OS (or Device)')
      break
    }
  },

  getFilePath: function (callBack, userSpec) {
    callBack = encodeURIComponent(callBack)
    userSpec = encodeURIComponent(userSpec)

    switch (this.browser.toString()) {
    case 'IOS':
      location.href = 'mfinity://getFilePath?callbackFunc=' + callBack + '&userSpecific=' + userSpec + ''
      break
    case 'ANDROID':
      window.mfinity.getFilePath(callBack, userSpec)
      break
    default:
      alert('mFinity does not support this OS (or Device)')
      break
    }
  },

  getDeviceSpec: function (callBack, userSpec, specname) {
    callBack = encodeURIComponent(callBack)
    userSpec = encodeURIComponent(userSpec)
    specname = encodeURIComponent(specname)

    switch (this.browser.toString()) {
    case 'IOS':
      if (specname == 'undefined' || specname == '') {
        location.href = 'mfinity://getDeviceSpec?callbackFunc=' + callBack + '&userSpecific=' + userSpec + ''
      } else {
        location.href =
            'mfinity://getDeviceSpec?callbackFunc=' +
            callBack +
            '&userSpecific=' +
            userSpec +
            '&specName=' +
            specname +
            ''
      }
      break
    case 'ANDROID':
      if (specname == 'undefined' || specname == '') {
        window.mfinity.getDeviceSpec(callBack, userSpec)
      } else {
        window.mfinity.getDeviceSpec(callBack, userSpec, specname)
      }
      break
    default:
      alert('mFinity does not support this OS (or Device)')
      break
    }
  },

  getNetworkStatus: function (callBack, userSpec) {
    callBack = encodeURIComponent(callBack)
    userSpec = encodeURIComponent(userSpec)

    switch (this.browser.toString()) {
    case 'IOS':
      location.href = 'mfinity://getNetworkStatus?callbackFunc=' + callBack + '&userSpecific=' + userSpec + ''
      break
    case 'ANDROID':
      window.mfinity.getNetworkStatus(callBack, userSpec)
      break
    default:
      alert('mFinity does not support this OS (or Device)')
      break
    }
  },

  getAccelerometer: function (callBack, userSpec) {
    callBack = encodeURIComponent(callBack)
    userSpec = encodeURIComponent(userSpec)

    switch (this.browser.toString()) {
    case 'IOS':
      location.href = 'mfinity://getAccelerometer?callbackFunc=' + callBack + '&userSpecific=' + userSpec + ''
      break
    case 'ANDROID':
      window.mfinity.getAccelerometer(callBack, userSpec)
      break
    default:
      alert('mFinity does not support this OS (or Device)')
      break
    }
  },

  getGyroscope: function (callBack, userSpec) {
    callBack = encodeURIComponent(callBack)
    userSpec = encodeURIComponent(userSpec)

    switch (this.browser.toString()) {
    case 'IOS':
      location.href = 'mfinity://getGyroscope?callbackFunc=' + callBack + '&userSpecific=' + userSpec + ''
      break
    case 'ANDROID':
      window.mfinity.getGyroscope(callBack, userSpec)
      break
    default:
      alert('mFinity does not support this OS (or Device)')
      break
    }
  },

  getMagneticField: function (callBack, userSpec) {
    callBack = encodeURIComponent(callBack)
    userSpec = encodeURIComponent(userSpec)

    switch (this.browser.toString()) {
    case 'IOS':
      location.href = 'mfinity://getMagneticField?callbackFunc=' + callBack + '&userSpecific=' + userSpec + ''
      break
    case 'ANDROID':
      window.mfinity.getMagneticField(callBack, userSpec)
      break
    default:
      alert('mFinity does not support this OS (or Device)')
      break
    }
  },

  getOrientation: function (callBack, userSpec) {
    callBack = encodeURIComponent(callBack)
    userSpec = encodeURIComponent(userSpec)

    switch (this.browser.toString()) {
    case 'IOS':
      location.href = 'mfinity://getOrientation?callbackFunc=' + callBack + '&userSpecific=' + userSpec + ''
      break
    case 'ANDROID':
      window.mfinity.getOrientation(callBack, userSpec)
      break
    default:
      alert('mFinity does not support this OS (or Device)')
      break
    }
  },

  getProximity: function (callBack, userSpec) {
    callBack = encodeURIComponent(callBack)
    userSpec = encodeURIComponent(userSpec)

    switch (this.browser.toString()) {
    case 'IOS':
      location.href = 'mfinity://getProximity?callbackFunc=' + callBack + '&userSpecific=' + userSpec + ''
      break
    case 'ANDROID':
      window.mfinity.getProximity(callBack, userSpec)
      break
    default:
      alert('mFinity does not support this OS (or Device)')
      break
    }
  },

  getFileList: function (callBack, userSpec, filepath) {
    callBack = encodeURIComponent(callBack)
    userSpec = encodeURIComponent(userSpec)
    filepath = encodeURIComponent(filepath)

    switch (this.browser.toString()) {
    case 'IOS':
      alert('mFinity does not support this OS (or Device)')
      break
    case 'ANDROID':
      window.mfinity.getFileList(callBack, userSpec, filepath)
      break
    default:
      alert('mFinity does not support this OS (or Device)')
      break
    }
  },

  getCheckSession: function (callBack, userSpec) {
    callBack = encodeURIComponent(callBack)
    userSpec = encodeURIComponent(userSpec)

    switch (this.browser.toString()) {
    case 'IOS':
      location.href = 'mfinity://getCheckSession?callbackFunc=' + callBack + '&userSpecific=' + userSpec + ''
      break
    case 'ANDROID':
      window.mfinity.getCheckSession(callBack, userSpec)
      break
    default:
      alert('mFinity does not support this OS (or Device)')
      break
    }
  },

  getUserInfo: function (callBack, userSpec) {
    callBack = encodeURIComponent(callBack)
    userSpec = encodeURIComponent(userSpec)

    switch (this.browser.toString()) {
    case 'IOS':
      location.href = 'mfinity://getUserInfo?callbackFunc=' + callBack + '&userSpecific=' + userSpec + ''
      break
    case 'ANDROID':
      window.mfinity.getUserInfo(callBack, userSpec)
      break
    default:
      alert('mFinity does not support this OS (or Device)')
      break
    }
  },

  getConvertImageToBase64: function (callBack, imagePath) {
    callBack = encodeURIComponent(callBack)
    imagePath = encodeURIComponent(imagePath)

    switch (this.browser.toString()) {
    case 'IOS':
      location.href = 'mfinity://getConvertImageToBase64?callbackFunc=' + callBack + '&imagePath=' + imagePath + ''
      break
    case 'ANDROID':
      window.mfinity.getConvertImageToBase64(callBack, imagePath)
      break
    default:
      alert('mFinity does not support this OS (or Device)')
      break
    }
  },

  getShake: function (callBack, userSpec) {
    callBack = encodeURIComponent(callBack)
    userSpec = encodeURIComponent(userSpec)

    switch (this.browser.toString()) {
    case 'IOS':
      alert('mFinity does not support this OS (or Device)')
      break
    case 'ANDROID':
      window.mfinity.getShake(callBack, userSpec)
      break
    default:
      alert('mFinity does not support this OS (or Device)')
      break
    }
  },

  setBackKeyEvent: function (backKeyEvent) {
    backKeyEvent = encodeURIComponent(backKeyEvent)

    switch (this.browser.toString()) {
    case 'IOS':
      alert('mFinity does not support this OS (or Device)')
      break
    case 'ANDROID':
      window.mfinity.setBackKeyEvent(backKeyEvent)
      break
    default:
      alert('mFinity does not support this OS (or Device)')
      break
    }
  },

  isRoaming: function (callBack, userSpec) {
    callBack = encodeURIComponent(callBack)
    userSpec = encodeURIComponent(userSpec)

    switch (this.browser.toString()) {
    case 'IOS':
      location.href = 'mfinity://isRoaming?callbackFunc=' + callBack + '&userSpecific=' + userSpec + ''
      break
    case 'ANDROID':
      window.mfinity.isRoaming(callBack, userSpec)
      break
    default:
      alert('mFinity does not support this OS (or Device)')
      break
    }
  },

  executeRecognizeSpeech: function (callBack, userSpec, succession) {
    callBack = encodeURIComponent(callBack)
    userSpec = encodeURIComponent(userSpec)

    switch (this.browser.toString()) {
    case 'IOS':
      if (succession == 'undefined' || succession == '') {
        location.href = 'mfinity://executeRecognizeSpeech?callbackFunc=' + callBack + '&userSpecific=' + userSpec + ''
      } else {
        location.href =
            'mfinity://executeRecognizeSpeech?callbackFunc=' +
            callBack +
            '&userSpecific=' +
            userSpec +
            '&succession=' +
            succession +
            ''
      }
      break
    case 'ANDROID':
      if (succession == 'undefined' || succession == '') {
        window.mfinity.executeRecognizeSpeech(callBack, userSpec)
      } else {
        window.mfinity.executeRecognizeSpeech(callBack, userSpec, succession)
      }
      break
    default:
      var returnValue = prompt('(executeRecognizeSpeech) 리턴값을 입력해 주세요')
      returnValue = encodeURIComponent(returnValue)
      window[callBack](userSpec, returnValue)
      break
    }
  },
}
