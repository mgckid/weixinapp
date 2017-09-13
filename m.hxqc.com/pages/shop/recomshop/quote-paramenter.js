// pages/shop/recomshop/quote-paramenter.js

var common = require('../../../utils/util.js')
var CFG = require('../../../utils/config.js')
var objPage = null;

// 获取车辆参数
function getItemParameter(itemID) {
  var url = CFG.APP_API_HOST + '/Mall/V2/Auto/itemParameter';
  common.httpRequest(url,{
    data: {extID:itemID},
    success: function (res) {
      var statusCode = res.statusCode;
      var info = res.data;
      if (undefined !== info.length) {
        objPage.setData({ info: info });
      } else {
        common.msg('未获取到产品参数');
      }
    }
  })
}

Page({
  data: {
    dl_showClass: '',
    info:[]
  },
  onLoad: function (options) {
    objPage = this;
    var itemID = options.itemID;
    getItemParameter(itemID);
  },
  dlShow: function () {
    if (this.data.dl_showClass === '') {
      this.setData({ dl_showClass: 'on' })
    } else {
      this.setData({ dl_showClass: '' })
    }
  },
  onPullDownRefresh: function (e) {
    wx.stopPullDownRefresh();
  }
})