Page({
  data: {
    img_list: []
  },
  onLoad: function (opt) {
    // 页面初始化 options为页面跳转所带来的参数
    var car_source_no = opt.car_source_no;
    var imgList = wx.getStorageSync('car_img_list')
    if (opt.car_source_no && imgList) {
      this.setData({ img_list: imgList });
    }
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onPullDownRefresh:function(){
    wx.stopPullDownRefresh()
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  onclickImage: function (e) {
    var urls = e.currentTarget.dataset.urls;
    var imgList = wx.getStorageSync('car_img_list');
    var imgUrlList = [];
    for (var i in imgList) {
      var r = imgList[i];
      imgUrlList.push(r.small_path);
    }
    wx.previewImage({
      current: urls,
      urls: imgUrlList
    })
  }
})