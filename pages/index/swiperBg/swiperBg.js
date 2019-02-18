// pages/index/swiperBg/swiperBg.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    current:0,
    luckyCardType:1,
    swiper:[
      "/img/SingleJing.png",
      "/img/MarryJing.png",
      "/img/fairyJing.png",
      "/img/BuddhaJing.png",
      "/img/tycoonJing.png"
    ],
    swiperTitle:[
      "/img/SingleTxt.png",
      "/img/MarryTxt.png",
      "/img/fairyTxt.png",
      "/img/BuddhaTxt.png",
      "/img/tycoonTxt.png"
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /** 
  * 滑动选择狗形象 
  */
  getCurren:function(e){
    this.setData({
      current: e.detail.current,
      luckyCardType: e.detail.current+1
    });
  }
  
})