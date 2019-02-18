// pages/index/history/history.js
const innerAudioContext = wx.createInnerAudioContext();
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageNum:1,
    pageSize: 10, 
    isHideLoadMore: true,
    cardList: [
      "/img/Single.png",
      "/img/Marry.png",
      "/img/fairy.png",
      "/img/Buddha.png",
      "/img/tycoon.png",
    ],
    historyList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //console.log(options)
    this.getHistoryList();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },


  //点击得到历史记录，跳转回填写卡页
  goForm:function(e){
    //console.log(e.currentTarget.dataset.id)
    let _id = e.currentTarget.dataset.id;//得到的历史记录的id
    wx.navigateTo({//回填历史祝福卡内容
      url: '/pages/index/form/form?id=' + _id
    });
  },


  //得到历史记录
  getHistoryList:function(){
    //console.log("获取历史")
    let that = this;
    let pageNum = that.data.pageNum,
        limit = that.data.limit;
    app.getRequest({
      url: "/znw/bestwishes/history",
      data:{
        token: app.globalData.token,
        pageSize: that.data.pageSize,
        pageNum: that.data.pageNum
      },
      success:function(data){
        //console.log(data)
        if (that.data.pageNum == 1){
          that.setData({
            totalStatistics: data.totalStatistics
          });
        }
        data.bestWishes.forEach(function (v, i) {
          v.isTouchMove = false;//添加默认全隐藏删除
        })
        that.data.historyList = that.data.historyList.concat(data.bestWishes);
        that.setData({
          historyList: that.data.historyList,
        });
      }
    })
  },

  //滚动加载
  getMoreHistoryList: function () {
    let that = this;
    that.setData({
      'pageNum': that.data.pageNum++
    })
    that.getHistoryList();
  },

  //上拉触底
  onReachBottom:function(){
    let that = this;
    //console.log("上拉" + that.data.pageNum)
    that.setData({
      isHideLoadMore: false,
      'pageNum': that.data.pageNum+1
    });
    setTimeout(()=>{
      that.setData({
        isHideLoadMore: true
      });
      that.getHistoryList();
    },2000);
  },

  //手指触摸动作开始 记录起点X坐标
  touchstart: function (e) {
    //console.log("手指触摸动作开始")
    //开始触摸时 重置所有删除
    this.data.historyList.forEach(function (v, i) {
      if (v.isTouchMove)//只操作为true的
        v.isTouchMove = false;
    })
    this.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,
      historyList: this.data.historyList
    })
  },

  //滑动事件处理
  touchmove: function (e) {
    var that = this,
      index = e.currentTarget.dataset.index,//当前索引
      startX = that.data.startX,//开始X坐标
      startY = that.data.startY,//开始Y坐标
      touchMoveX = e.changedTouches[0].clientX,//滑动变化坐标
      touchMoveY = e.changedTouches[0].clientY,//滑动变化坐标
      //获取滑动角度
      angle = that.angle({ X: startX, Y: startY }, { X: touchMoveX, Y: touchMoveY });
    that.data.historyList.forEach(function (v, i) {
      //console.log("滑动事件处理")
      
      v.isTouchMove = false;
      //滑动超过30度角 return
      if (Math.abs(angle) > 30) return;
      if (i == index) {
        //console.log(e)
        if (touchMoveX > startX) //右滑
          v.isTouchMove = false
        else //左滑
          v.isTouchMove = true
      }
    })
    //更新数据
    that.setData({
      historyList: that.data.historyList
    })
  },
  /**
   * 计算滑动角度
   * @param {Object} start 起点坐标
   * @param {Object} end 终点坐标
   */
  angle: function (start, end) {
    var _X = end.X - start.X,
      _Y = end.Y - start.Y
    //返回角度 /Math.atan()返回数字的反正切值
    return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
  },
  //删除事件
  del: function (e) {
    let self = this;
    self.data.historyList.splice(e.currentTarget.dataset.index, 1);
    app.getRequest({
      url: "/znw/bestwishes/remove",
      data: {
        token: app.globalData.token,
        bestWishesId: e.currentTarget.dataset.id
      },
      success:function(data){
        if (data.state == 1){
          self.setData({
            historyList: self.data.historyList
          });
        }
      }
    })
    
  }
})