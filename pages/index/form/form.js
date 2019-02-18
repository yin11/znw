// pages/index/form/form.js
const app = getApp();
var MD5 = require('../../../utils/md5.js');
const recorderManager = wx.getRecorderManager();
const innerAudioContext = wx.createInnerAudioContext();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tapeTxt:"按住说话",
    showAudio:false,
    fromTitle:"",
    toTitle: "",
    wishesContent:"",
    showTape:true,
    bestWishes:{
      
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //console.log(options)
    let self =this;
    if (options.id){//从历史记录回填
      //console.log("回填")
      self.openBestwishes(options.id);
    }else{//正常填写
      //console.log(Number(options.luckyCardType))
      self.setData({
        luckyCardType: Number(options.luckyCardType)
      });
    }  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  onHide: function () {
    //console.log("准备关闭")
    this.stopTape();
  },

  onUnload:function(){
    //console.log("准备关闭")
    this.stopTape();
  },

  //开始录音
  startTape:function(e){
    console.log(e)
    console.log('开始' + e.timeStamp)
    let self = this;
    this.setData({
      tapeTxt:"正在录制",
      tapeIco:"on",
      startTimeStamp: e.timeStamp
    }); 
    const options = {
      duration: 10000,//指定录音的时长，单位 ms
      sampleRate: 16000,//采样率
      numberOfChannels: 1,//录音通道数
      encodeBitRate: 96000,//编码码率
      format: 'mp3',//音频格式，有效值 aac/mp3
      frameSize: 50,//指定帧大小，单位 KB
    }
    //开始录音
    recorderManager.start(options);
    recorderManager.onStart(() => {
      //console.log("开始录音" + e.timeStamp);
    });
    //错误回调
    recorderManager.onError((res) => {
      //console.log("录音失败" + res.errMsg);
      //console.log(res)
      wx.showToast({
        icon: 'none',
        title: res.errMsg,
        duration: 2000
      })
    });
    setTimeout(function(){
      self.endTape();
    },60000);
  },
  //结束录音
  endTape:function(e){
    let self =this;
    let _time = (e.timeStamp - self.data.startTimeStamp)/1000,
        audioTime=(_time % 60 / 100).toFixed(2).slice(-2).replace(/\b(0+)/gi, "");
    _time = Math.floor(_time / 60) + ":" + (_time % 60 / 100).toFixed(2).slice(-2);
    //console.log("录音时长" + audioTime)
    if (audioTime < 3){//录音时长太短
      recorderManager.stop();
      //recorderManager.stop();//recorderManager怎么销毁这个
      self.setData({
        tapeTxt: "按住说话",
        tapeIco: "",
      });
      wx.showToast({
        icon: 'none',
        title: "您的录音时间太短，录音时间需超过3秒",
        duration: 2000
      })
    }else{
      self.setData({
        tapeTxt: "按住说话",
        tapeIco: "",
        showTape: false,
        play: true, //静态音阶
        audioTime: audioTime,
        tapeTime: _time
      });
    }
    recorderManager.stop();
    recorderManager.onStop((res) => {
      if (audioTime < 3) {//录音时长太短
      
      }else{
        self.tempFilePath = res.tempFilePath;//存入本地录音路径
        //console.log(self)
        //console.log("存入本地录音路径" + res.tempFilePath)
       // const { tempFilePath } = res;
      } 
    });
    /*recorderManager.onFrameRecorded((res) => {
      //console.log('录制完', res.frameBuffer)
    });*/
  },


  //获取输入的对方称呼
  getToTitle:function(e){
    //console.log(e.detail.value)
    this.setData({
      toTitle: e.detail.value
    })
  },
  //获取输入的祝福落款
  getFromTitle: function (e) {
    //console.log(e.detail.value)
    this.setData({
      fromTitle: e.detail.value
    })
  },
  //获取输入的祝福语
  getWishesContent: function (e) {
    //console.log(e)
    this.setData({
      wishesContent: e.detail.value
    })
  },

  //将祝福语与录音存入本地，方便预览
  setStorage:function(){
    let self = this,
      _state = self.data.fromTitle || self.data.wishesContent || self.data.toTitle ,
      preview = false;
    _state ? preview = true : preview = false ;//是否填写了文字信息
    //console.log(app.globalData.userInfo)
    //清楚缓存
    wx.removeStorage({
      key: 'preview',
      success: function (res) {
        //console.log(res.data + "清楚缓存成功")
      }
    });
    wx.setStorage({
      key: "preview",
      data: {
        fromTitle: self.data.fromTitle || app.globalData.userInfo.nickName,//落款
        toTitle: self.data.toTitle,//对方称呼
        wishesContent: self.data.wishesContent,//祝福语
        luckyCardType: self.data.luckyCardType,//发祝福时的形象
        audioUrl: self.tempFilePath,//暂时的录音路径
        audioTime:self.data.audioTime,//录音时长
        preview: preview//预览的状态
      }
    });
    //console.log("点击预览"+self.tempFilePath)
    /*wx.navigateTo({
      url: '/pages/index/collarRed/collarRed?preview=1' 
    });*/
    if (self.tempFilePath) {//祝福含有录音
      self.uploadTape();
      //console.log("from有路由" + self.tempFilePath)
    } else {//不含录音
      self.uploadWish();
    }
  },

  //点击音频图案播放录音
  tapPlayTape:function(){
    let self = this;
    //console.log("点击音频图案播放录音" + self.tempFilePath)
    //console.log(self)
    innerAudioContext.obeyMuteSwitch =false;
    innerAudioContext.autoplay = true;
    innerAudioContext.src = self.tempFilePath;
    innerAudioContext.play();
    innerAudioContext.onPlay(() => {
     // console.log('开始播放' + innerAudioContext.src);
      self.setData({
        play: false //静态音阶
      });
      //console.log(self.data.play)
    });
    innerAudioContext.onEnded(()=>{
      self.setData({
        play: true //静态音阶
      });
    })
    innerAudioContext.onError((res) => {
      console.log(res)
      //console.log(res.errCode)
    })
  },

  //停止播放祝福音频
  stopTape: function () {
    let self = this;
    //console.log("停止")
    innerAudioContext.stop();
    innerAudioContext.onStop(() => {
      //console.log('停止播放555')
      self.setData({
        AudioState: false,
        play: true //静态音阶
      });
    });
    innerAudioContext.onError((res) => {
      //console.log(res.errMsg)
      //console.log(res.errCode)
    })
  },

  //长按音频图案删除录音
  longDeleteTape: function () {
    //console.log("长按音频图案删除录音")
    //innerAudioContext.stop();
    let self = this;
    self.stopTape();
    //console.log( self)
    wx.showModal({
      title: "确定删除录音吗",
      content: '',
      confirmText:"删除",
      success:function(res){
        if (res.confirm) {
          self.tempFilePath=null;
          self.setData({  
            showTape:true
          });
          //console.log("self+" + self.data.tempFilePath)
        } else if (res.cancel) {
          //console.log('用户点击取消')
        }
      },
      fail:function(){
        //console.log("删除失败")
      }
    })
  },

  //从历史记录，通过id打开祝福，回填信息
  openBestwishes: function (_bestWishesId) {
    let that = this;
    //console.log(app.globalData.userInfo);
    app.postRequest({
      url: "/znw/openBestwishes",
      data: {
        bestWishesId: _bestWishesId,
        token: app.globalData.token,
        //nickName: app.globalData.userInfo.nickName,
        //gender: app.globalData.userInfo.gender
      },
      success: function (data) {
        //console.log(data.data.audioUrl+"录音路径")
        if (data.data.audioUrl){//有录音时
          that.tempFilePath = data.data.audioUrl;
          let tapeTime;
          data.data.audioTime < 10 ?  tapeTime = ("0:0" + data.data.audioTime) :  tapeTime = ("0:" + data.data.audioTime) ;
          that.setData({
            showTape: false,
            play: true,
            tapeTime: tapeTime
          });
        }
        that.setData({
          fromTitle: data.data.fromTitle,
          toTitle: data.data.toTitle,
          wishesContent: data.data.wishesContent,
          luckyCardType: data.data.luckyCardType,
          audioUrl: data.data.audioUrl,
          audioTime: data.data.audioTime
        });
      }
    });
  },

  //上传录音以及祝福语
  uploadTape: function (_url) {
    let self = this,
      _data = {
        token: app.globalData.token,
        fromTitle: self.data.fromTitle,//落款
        toTitle: self.data.toTitle,//对方称呼
        wishesContent: self.data.wishesContent,//祝福语
        luckyCardType: self.data.luckyCardType,//发祝福时的形象
        audioTime: self.data.audioTime//录音时长
        // audio: self.tempFilePath
      };
    if (self.tempFilePath.indexOf('http') !== -1) {//判断是否是本地文件
      _data.audioUrl = self.tempFilePath;
      app.postRequest({
        url: "/znw/genBestwishes",
        data: _data,
        success: function (data) {
          if (data.state == 1) {//生成祝福成功
            //console.log("生成祝福成功" + data.data)
            wx.navigateTo({
              url: '/pages/index/collarRed/collarRed?preview=1&bestWishesId=' + data.data,
            })
          }
        },
        fail: function () {
          wx.showToast({
            icon: 'none',
            title: "回填请求失败" + res.errMsg,
            duration: 2000
          });
        }
      });
    }else{
      wx.uploadFile({//上传祝福卡的相关信息(只能上传本地文件)
        url: app.globalData.ctxpath + '/znw/genBestwishes',
        filePath: self.tempFilePath,
        name: 'file',
        header: {
          "miniProgram": "ios",//新增的判断为安卓还是ios
          "sec": MD5.hexMD5(app.asciiSort(_data))
        },
        formData: {
          token: app.globalData.token,
          fromTitle: self.data.fromTitle,//落款
          toTitle: self.data.toTitle,//对方称呼
          wishesContent: self.data.wishesContent,//祝福语
          luckyCardType: self.data.luckyCardType,//发祝福时的形象
          audioTime: self.data.audioTime//录音时长
        },
        success: function (res) {
          //console.log(typeof res.data)
          //console.log(res.data)
          let data = JSON.parse(res.data);
          if (data.state == 1) {//生成祝福成功
            //console.log("生成祝福成功" + data.data)
            wx.navigateTo({
              url: '/pages/index/collarRed/collarRed?preview=1&bestWishesId=' + data.data,
            })
          } else {
            wx.showToast({
              icon: 'none',
              title: decodeURIComponent(data.msg),
              duration: 2000
            });
          }
        },
        fail: function (res){
          //console.log(res)
          //let aa = JSON.stringify(res)
          wx.showToast({
            icon: 'none',
            title: "发起请求失败" + res.errMsg  ,
            duration: 2000
          });
        }
      })
    }
  },

  //上传祝福语
  uploadWish: function () {
    let self = this;
    let _data = {
      token: app.globalData.token,
      fromTitle: self.data.fromTitle,//落款
      toTitle: self.data.toTitle,//对方称呼
      wishesContent: self.data.wishesContent,//祝福语
      luckyCardType: self.data.luckyCardType,//发祝福时的形象
    };
    app.postRequest({
      url: "/znw/genBestwishes",
      data: _data,
      success: function (data) {
        wx.navigateTo({
          url: '/pages/index/collarRed/collarRed?preview=1&bestWishesId=' + data.data,
        });
      },
      fail:function(){
        wx.showToast({
          icon: 'none',
          title: "进入请求失败" ,
          duration: 5000
        })
      }
    });
  },
  
})