//index.js
//获取应用实例
const app = getApp();
const innerAudioContext = wx.createInnerAudioContext();

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    cardList:[
      "/img/Single.gif",
      "/img/Marry.gif",
      "/img/fairy.gif",
      "/img/Buddha.gif",
      "/img/tycoon.gif"
    ],
    imgLIst:[
      "/img/Single.png",
      "/img/Marry.png",
      "/img/fairy.png",
      "/img/Buddha.png",
      "/img/tycoon.png"
    ],
    audio: app.globalData.defaultAudio,//默认音频
    //shareIn:true,//从分享入口进
    //showBag: false,//红包是否显示
    changeState:true,
    bestWishes:{
      luckyCardType:1
    },
    showSuccessTxt:"兑换成功",//是否已经兑换
    showAudio:true,//录音旋转图标是否显示
    cardNum:[3,0,0,0,0],
    gerCradList:[
      "/img/noAlert.png",
      "/img/SingleAlert.png",
      "/img/MarryAlert.png",
      "/img/fairyAlert.png",
      "/img/BuddhaAlert.png",
      "/img/tycoonAlert.png",
    ],
    cardDetailList:[
      {},
      {},
      {},
      {},
      {}
    ]
    
  },
  
  onLoad: function (option) {
    //option.bestWishesId = 30;//测试
    let self =this;
    //console.log(option)
    app.Promise.then(function (token) {// success
      self.setData({
        token: token,
        defaultAudio: app.globalData.defaultAudio
      });
      if (option.bestWishesId) {//通过分享页面进入，有祝福Id时
        //console.log("分享进入" + option.bestWishesId)
        self.setData({
          bestWishesId: option.bestWishesId,
         // shareIn: false,
        });
        self.openBestwishes(option.bestWishesId);
      } else { // 正常入口进 
        if (option.luckyCardType) {//祝福海报分享成功后得到
          self.setData({
            showAudio:false,
            showGetCard: true, // 显示得到卡了
            showCardNum: option.luckyCardType,
          });
        }else{
          //播放录音
          self.playTape();
        }
      }
      self.getluckyCard();//获取用户所属的好运卡
    }, function (error) {
      // failure
      //console.log(error)
    });
    //清楚缓存
    wx.removeStorage({
      key: 'preview',
      success: function (res) {
        //console.log(res.data+"清楚缓存成功")
      }
    })
    
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    
  },

  onHide:function(){
    //console.log("准备关闭")
    this.stopTape();
  },

  //获取用户所属的好运卡
  getluckyCard:function(){
    let self = this;
    app.getRequest({
      url:"/znw/luckyCardStatistics",
      data:{
        token: self.data.token
      },
      success:function(data){
        let _arr = [], state = false;
        if (data.data.exchangeNum == 0){//表示未领取过话币
          _arr = [data.data.unmarriedNum, data.data.urgedMarryNum, data.data.fairyNum, data.data.buddhaNum, data.data.richNum];
          self.setData({
            cardNum: _arr
          });
          _arr.forEach(function (v) {
            //state = Object.is(v, 0);//有一个为0是，返回true，此时狗卡未集齐,则不显示兑换按钮
            if (Object.is(v, 0)){
              state = true;
            }
          });
          //console.log("兑换状态" + state)
          if (!state){//已集齐单未领取
            self.setData({
              download: true
            });
          }
          self.setData({
            shareIn: false , //此时显示底部内容
            changeState: state
          });
        }else{//已领取且不能再领
          self.setData({
            shareIn:true,
            changeState:false,
            download:false
          })
        }       
      }
    });
  },

  //分享进入通过id打开祝福
  openBestwishes: function (_bestWishesId){
    let that = this;
    app.postRequest({
      url: "/znw/openBestwishes",
      data: {
        bestWishesId: _bestWishesId,
        token: that.data.token,
        //nickName: app.globalData.userInfo.nickName,
        //gender: app.globalData.userInfo.gender
      },
      success: function (data) {
        that.setData({
          bestWishes: data.data
        }); 
        //播放录音
        that.playTape();
      }
    });
  },

  //播放祝福音频
  playTape:function(){
    let self = this;
    innerAudioContext.autoplay = true;
    innerAudioContext.obeyMuteSwitch = false;
    innerAudioContext.src = self.data.bestWishes.audioUrl || app.globalData.defaultAudio ;
    //console.log(self.data.bestWishes.audioUrl || app.globalData.defaultAudio)
    //console.log(self.data.bestWishes.audioUrl +"---audioUrl")
    //console.log(app.globalData.defaultAudio + "---audioUrl")
    innerAudioContext.play();
    innerAudioContext.onPlay(() => {
      //console.log('开始播放' + innerAudioContext.src)
      self.setData({
        AudioState: true,
        showAudio:true
      });
    });
    //console.log(innerAudioContext)
    innerAudioContext.onEnded(()=>{//自然播放停止
      self.setData({
        showAudio:false
      })
    })
    innerAudioContext.onError((res) => {
      console.log(res)
      ////console.log(res.errCode)
    })
  },

  //停止播放祝福音频
  stopTape:function(){
    let self = this;
    innerAudioContext.stop();
    innerAudioContext.onStop(() => {
      //console.log('停止播放555' )
      self.setData({
        AudioState:false
      });
    });
    innerAudioContext.onError((res) => {
      //console.log(res.errMsg)
      //console.log(res.errCode)
    })
  },

  //点击小图标播放或暂停
  playOrStop:function(e){
    let self = this;
    //console.log("AudioState++"+self.data.AudioState)
    innerAudioContext.autoplay = true;
    innerAudioContext.src = self.data.bestWishes.audioUrl;
    if(!self.data.AudioState){//点击关闭
      innerAudioContext.onPlay(() => {
        //console.log('开始播放' + innerAudioContext.src)
        self.setData({
          AudioState: true
        });
      });
    }else{
       innerAudioContext.onStop(() => {
        //console.log('停止播放555')
        self.setData({
          AudioState: false
        });
      });
    }
    innerAudioContext.onError((res) => {
      //console.log(res.errMsg)
      //console.log(res.errCode)
    });
  },

  //关闭提示得到的卡类型弹窗
  closeGetCard:function(){
    this.setData({
      showGetCard: false
    })
  },

  //显示所选的卡详情
  showCardDetail:function(e){
    let _data = {
      showDate: true,
      current: e.currentTarget.dataset.id
    };
    this.setData({
      showCardDetail: _data
    })
  },

  //关闭所选的卡详情
  closeCardDetail: function (e) {
    let _data = {
      showDate: false
    }
    this.setData({
      showCardDetail: _data
    })
    //console.log("关闭卡详情");
  },

  //点击兑换
  exchange:function(){
    let self =this;
    let _phone = self.data.phone.length;
    //console.log(_phone)
    if (_phone !== 11 && _phone>0){
      self.setData({
        showExchange: false,
      });
      wx.showToast({
        icon: 'none',
        title: "请输入正确的手机号",
        duration: 2000
      });
    } else if (_phone == 11){
      self.setData({
        showExchange: false,
      });
      app.getRequest({
        url: "/znw/exchangeluckycard",
        data: {
          token: self.data.token,
          phone: self.data.phone
        },
        success: function (data) {
          if (data.state == 1) {
            //console.log("兑换成功")
            self.setData({
              showSuccess: true,
              download:false,
              shareIn: true
            });
          }
        }
      });
    }else{
      self.setData({
        showExchange: false,
      });
      wx.showToast({
        icon: 'none',
        title: "请输入手机号",
        duration: 2000
      });
    }
  },

  //获取输入手机号
  getPhone:function(e){
    this.setData({
      phone: e.detail.value
    })
  },

  //显示集齐卡兑换的弹窗
  showExchange:function(){
    this.setData({
      showExchange: true
    })
  },

  //关闭集齐卡兑换的弹窗
  closeExchange:function(){
    this.setData({
      showExchange: false
    })
  },

  //跳转下载助商通应用宝
  goLink:function(){
    wx.navigateTo({
      url: '/pages/index/link/link',
    })
  },

  //点击立即下载显示弹窗
  showDownload:function(){
    this.setData({
      showSuccess:true
    })
  },

  //滑动切换卡详情
  bindChange: function (e) {
    var that = this;
    that.data.showCardDetail.current = e.detail.current;
    that.setData({
      showCardDetail: that.data.showCardDetail
    });
  },

  //关闭兑换成功提示框
  colseSuccessAlert:function(){
    this.setData({
      showSuccess: false
    })
  },

  getUserInfo: function(e) {
    //console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})
