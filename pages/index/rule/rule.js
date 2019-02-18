// pages/index/rule/rule.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hide:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },


  //点击显示回答
  showAnswer:function(e){
    let self = this;
    if (self.data.curten == e.currentTarget.dataset.id){
      this.setData({
        curten: ""
      })
    }else{
      this.setData({
        curten: e.currentTarget.dataset.id
      })
    }
  }
})