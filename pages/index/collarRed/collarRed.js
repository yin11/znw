// pages/index/collarRed/collarRed.js
const app = getApp();
var MD5 = require('../../../utils/md5.js');
const innerAudioContext = wx.createInnerAudioContext();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    preview: {
      preview: false,
    },
    swiper: [
      "/img/Single.gif",
      "/img/Marry.gif",
      "/img/fairy.gif",
      "/img/Buddha.gif",
      "/img/tycoon.gif"
    ],
    shareImg: [
      "/img/SingleForward.png",
      "/img/MarryForward.png",
      "/img/fairyForward.png",
      "/img/BuddhaForward.png",
      "/img/tycoonForward.png",
    ],
    showAudio: true,//录音旋转图标是否显示
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let self = this;
    //console.log( options)
    const preview = wx.getStorageSync('preview');//得到缓存
    //console.log(preview);
    self.setData({
      preview: preview,
      bestWishesId: options.bestWishesId
    });
    if (! preview.audioUrl){//没有有音频
      //console.log("没有录音")
      self.setData({
        showMisic: false,
        showAudio:true
      });
    }else{
      //console.log("有录音" + preview.audioUrl)
      self.setData({
        showMisic: true,
        showAudio: false
      });
      //播放录音
      self.playTape();
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  onUnload: function () {
    //console.log("准备关闭")
    this.stopTape();
  },

  //转发(点击发送时先保存模板再发送)
  onShareAppMessage: function (options){
    let self = this , _data;
    /*const Promise = self.send() ;
    Promise.then(function (data){
      //console.log(data)
      if (data.state ==1){
         //console.log("成功")
      }else{
        wx.showToast({
          icon: 'none',
          title: decodeURIComponent(data.msg),
          duration: 2000
        })
      }     
    }) */
    return {
      title: (self.data.preview.fromTitle || app.globalData.userInfo.nickName) + '给您拜年了' ,
      path: '/pages/index/index?bestWishesId=' + self.data.bestWishesId,
      imageUrl: self.data.shareImg[self.data.preview.luckyCardType - 1],
      success: function (res) {// 转发成功获取卡
        //console.log(res)
        //console.log('/pages/index/index?bestWishesId=' + self.data.bestWishesId)
        self.assignLuckycard();
      },
      fail: function (res) {// 转发失败
        //console.log(res)
      }
    }
  },

  //send
  send:function(){
    let self =this;
    let promise = new Promise(function (resolve, reject){
      //进行模板保存
      if (self.tempFilePath) {//祝福含有录音
        self.uploadTape(function(data){
          //console.log(data)
          self.setData({
            bestWishesId: data.data
          })
          resolve(data);
        });
        //console.log("有路由")
      } else {//不含录音
        self.uploadWish(function (data) {
          self.setData({
            bestWishesId: data.data
          })
          resolve(data);
        });
      }
    })
    return promise;
  },

  //分享成功获得好运卡
  assignLuckycard: function () {
    let self = this;
    let _data = {
      token: app.globalData.token,
      bestWishesId: self.data.bestWishesId,
    };
    wx.request({
      url: app.globalData.ctxpath + "/znw/assignLuckycard",
      data: _data,
      method: 'GET',
      header: {
        "miniProgram": "ios",//新增的判断为安卓还是ios
        "sec": MD5.hexMD5(app.asciiSort(_data))
      },
      success: function (res) {
        if (res.data.state == 1) {
          ////console.log("转发成功luckycardType="+res.data.luckycardType)
          wx.reLaunch({//获取卡成功返回首页
            url: '/pages/index/index?luckyCardType=' + res.data.luckycardType 
          });
        } else if (res.data.state == 700401) {
          wx.reLaunch({//获取卡成功返回首页
            url: '/pages/index/index?luckyCardType=0'
          });
        }else{
          wx.showToast({
            title: '获取设备信息失败',
            icon: decodeURIComponent(res.data.msg),
            duration: 2000
          })
        }
      },
      fail: function () {
        //console.log(请求失败)
      }
    })
  },

  //播放祝福音频
  playTape: function () {
    let self = this;
    innerAudioContext.autoplay = true;
    innerAudioContext.obeyMuteSwitch = false;
    innerAudioContext.src = self.data.preview.audioUrl;
    innerAudioContext.onPlay(() => {
      self.setData({
        showAudio: true
      });
    });
    innerAudioContext.onEnded(() => {//自然播放停止
      self.setData({
        showAudio: false
      })
    })
    innerAudioContext.onError((res) => {
      //console.log(res)
      ////console.log(res.errCode)
    })
  },

  //停止播放祝福音频
  stopTape: function () {
    let self = this;
    innerAudioContext.stop();
    innerAudioContext.onStop(() => {
      //console.log('停止播放555')
    });
    innerAudioContext.onError((res) => {
      //console.log(res.errMsg)
      //console.log(res.errCode)
    })
  },

  //保存祝福卡信息
  submitInfo: function () {
    let self = this;
    wx.navigateTo({//存储生成祝福的id
      url: '/pages/index/history/history' 
    });
    /*if (self.tempFilePath) {//祝福含有录音
      self.uploadTape(function(data){
        wx.navigateTo({//存储生成祝福的id
          url: '/pages/index/history/history?bestWishesId=' + data.data
        });
      });
      //console.log("有路由")   
    } else {//不含录音
      self.uploadWish(function (data){
        wx.navigateTo({//存储生成祝福的id
          url: '/pages/index/history/history?bestWishesId=' + data.data
        });
      });
    }*/
  },

  //上传录音以及祝福语
  uploadTape: function (_success) {
    let self = this,
      _data = {
        token: app.globalData.token,
        fromTitle: self.data.preview.fromTitle,//落款
        toTitle: self.data.preview.toTitle,//对方称呼
        wishesContent: self.data.preview.wishesContent,//祝福语
        luckyCardType: self.data.preview.luckyCardType,//发祝福时的形象
        audioTime: self.data.preview.audioTime//录音时长
        // audio: self.tempFilePath
      };
    if (self.tempFilePath.includes('http')) {
      _data.audioUrl = self.tempFilePath;
    }
    //console.log("签名：" + app.asciiSort(_data))
    wx.uploadFile({//上传祝福卡的相关信息
      url: app.globalData.ctxpath + '/znw/genBestwishes',
      filePath: self.tempFilePath,
      name: 'file',
      header: {
        "miniProgram": "ios",//新增的判断为安卓还是ios
        "sec": MD5.hexMD5(app.asciiSort(_data))
      },
      formData: {
        token: app.globalData.token,
        fromTitle: self.data.preview.fromTitle,//落款
        toTitle: self.data.preview.toTitle,//对方称呼
        wishesContent: self.data.preview.wishesContent,//祝福语
        luckyCardType: self.data.preview.luckyCardType,//发祝福时的形象
        audioTime: self.data.preview.audioTime//录音时长
      },
      success: function (res) {
        let data = JSON.parse(res.data);
       
        if (data.state == 1) {//生成祝福成功
          _success(data);
          //console.log("生成祝福成功" + data.data)
          
        } else {
          wx.showToast({
            icon: 'none',
            title: decodeURIComponent(data.msg),
            duration: 2000
          });
        }
      }
    })
  },

  //上传祝福语
  uploadWish: function (_success) {
    let self = this;
    let  _data = {
        token: app.globalData.token,
        fromTitle: self.data.preview.fromTitle || app.globalData.userInfo.nickName,//落款
        toTitle: self.data.preview.toTitle,//对方称呼
        wishesContent: self.data.preview.wishesContent,//祝福语
        luckyCardType: self.data.preview.luckyCardType,//发祝福时的形象
      };
     app.postRequest({
       url:"/znw/genBestwishes",
       data: _data,
       success:function(data){
         _success(data);
       }
     });    
  },
})