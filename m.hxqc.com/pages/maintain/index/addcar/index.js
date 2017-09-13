 // pages/maintain/index/addcar/index.js
var common = require('../../../../utils/util.js')
var CFG = require('../../../../utils/config.js')
var objPage = null;

function onSubmit(e) {
  var opt = e.detail.value;
  var distance = parseFloat(opt.distance);
  if (distance <= 0) {
    common.msg('请输入行驶里程');
    return
  } else {
    // 写缓存+跳页面
    var url = '/pages/maintain/index/choose/index';
    wx.setStorage({
      key: 'maintain_defalut_model_driving_distance',
      data: distance,
      success: function (res) {
        wx.redirectTo({ url: url })
      },
      fail: function () {
        common.msg('行驶距离缓存写入失败');
      }
    })
  }
}

Page({
  data: {
    def_model: {}
  },
  onLoad: function (opt) {
    objPage = this;

    // 获取缓存：
    var k = 'maintain_repair_default_model_info';
    var default_model = wx.getStorageSync(k);
    if (undefined !== default_model && undefined !== default_model.brandName) {
      objPage.setData({ def_model: default_model });
    } else {
      wx.redirectTo({ url: '/pages/maintain/repair/filter?type=maintain_addcar' })
    }
  },
  onSubmit: function (e) {
    onSubmit(e);
  },
  onPullDownRefresh: function (e) {
    wx.stopPullDownRefresh();
  }
})