// pages/index/index.js
var p = 1;
var getPageList = function (that) {
  wx.request({
    url: 'http://api.houduanniu.com/?route=Post/latestPost', //仅为示例，并非真实的接口地址
    method: 'GET',
    data: {
      dictionary_value: 'article',
      p: p,
      page_size: 3
    },
    header: {
      'content-type': 'application/json' // 默认值
    },
    success: function (res) {
      if (res.data.code != 200) {
        return false;
      }
      var getData = res.data.data.list;
      var dataList = that.data.list;
      console.log(dataList);
      for (var i = 0; i < getData.length; i++) {
        var item = getData[i];
        dataList.push({ title: item.title, description: item.description, created: item.created, post_id: item.post_id });
      }
      that.setData({ list: dataList });
      p++;
    }
  })
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    getPageList(that)
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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    p = 1;
    this.setData({ list: [] });
    getPageList(this);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    getPageList(that)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})