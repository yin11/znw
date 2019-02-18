//app.js
var MD5 = require('/utils/md5.js');

const innerAudioContext = wx.createInnerAudioContext();
App({
  onLaunch: function (res) {
    var _self = this;
    _self.getSystemInfo();//获取设备信息
    _self.Promise = _self.login();//登录得到token
    _self.getUserInfo();
  },
  Promise: null,
  //wx.login登录
  login: function () {
    let _self =this;
    var promise = new Promise(function (resolve, reject) {
      wx.login({
        success: res => {
          if (res.code) {
            _self.getRequest({
              url: "/znw/openid",
              data: {
                js_code: res.code
              },
              success: function (data) {
                //console.log(data.data.token)
                _self.globalData.token = data.data.token;
                _self.globalData.defaultAudio = data.data.defaultAudio;
                //console.log(_self.globalData.defaultAudio)
                resolve(data.data.token);
                
              }
            }) //获取token
          } else {
            console.log('获取用户登录态失败！' + res.errMsg)
          }
        }
      });
    });
    return promise;
  },

  //获取用户信息
  getUserInfo:function(){
    let self = this;
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {// 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            //withCredentials:true,
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              self.globalData.userInfo = res.userInfo;

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (self.userInfoReadyCallback) {
                self.userInfoReadyCallback(res)
              }
            }
          })
        } else if (!res.authSetting['scope.record']) {//未授权获取用户信息
          wx.authorize({
            scope: 'scope.userInfo',
            success() {
              // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
              wx.startRecord();
            }
          })
        } else if (!res.authSetting['scope.record']) {
          wx.authorize({
            scope: 'scope.record',
            success() {
              // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
              wx.getUserInfo();
            }
          })
        }
      }
    });
  },

  //请求接口GET
  getRequest: function (json) {
    let _myself = this;
    wx.request({
      url: this.globalData.ctxpath + json.url,
      data: json.data,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        "miniProgram": "ios",//新增的判断为安卓还是ios
        "sec": MD5.hexMD5(_myself.asciiSort(json.data))
      },
      success: function (res) {
        if (res.data.state == 1) {
          json.success(res.data);
        } else {
          wx.showToast({
            icon: 'none',
            title: decodeURIComponent(res.data.msg),
            duration: 2000
          })
        }
      },
      fail: function () {
        console.log(请求失败)
      },
      complete: json.complete || function(){}
    })
  },
  //请求接口POST
  postRequest: function (json) {
    let _myself = this;
    wx.request({
      url: this.globalData.ctxpath + json.url,
      data: json.data,
      dataType: "json",
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        "miniProgram": "ios",//新增的判断为安卓还是ios
        "sec": MD5.hexMD5(_myself.asciiSort(json.data))
      },
      success: function (res) {
        if (res.data.state == 1) {
          json.success(res.data);
        } else {
          wx.showToast({
            icon: 'none',
            title: decodeURIComponent(res.data.msg),
            duration: 2000
          })
        }
      },
      fail: json.fail || function(res){
        wx.showToast({
          icon: 'none',
          title: decodeURIComponent(res.errMsg),
          duration: 2000
        })
      },
      complete: json.complete
    })
  },
  /*
  *  ascall码排序
  *  json
  *  */
  asciiSort: function (json) {
    let arr = [], _json = {}, str = "", qqq="", reg = /\,/ ;
    for (i in json) {
      if (json[i] !== "" && json[i] !== undefined) {
        arr.push(i);
      }
    }
    arr.sort();
    for (var i = 0; i < arr.length; i++) {
      var name = arr[i];
      str += name +"="+ json[name]+"&";
    }
    _json = str + "key=" + this.globalData.key;
    return _json;
  },
  
  //用户登录
  getLogin: function (code,succ) {
    let _self = this;
    _self.getRequest({
      url: "/znw/openid",
      data: {
        js_code: code
      },
      success: function (data) {
        _self.globalData.token = data.data.token;
        succ();
      }
    })
  },
  //获取设备信息
  getSystemInfo:function(){
    let _self =this;
    wx.getSystemInfo({
      success: function (res) {
        _self.globalData.systemInfo = res;
      },
      fail:function(){
        wx.showToast({
          title: '获取设备信息失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },

  //点击播放录音
  playTape:function(json){
    let self = this;
    innerAudioContext.autoplay = true;
    innerAudioContext.src = json.url;
    innerAudioContext.onPlay(() => {
      json.onPlay
    });
    innerAudioContext.onEnded(() => {
      json.onEnded
    });
    innerAudioContext.onError((res) => {
      json.onError
    });
  },

  globalData: {
    userInfo: {},
    ctxpath: "https://XXXXXXX.com/api/voip",
    
    token:null,
    key: "XXXXXXXXXXXX",
    
  }
})