// pages/shop/newcar/list.js
var common = require('../../../utils/util.js')
var CFG = require('../../../utils/config.js')
var objPage = null;

// 新车销售列表页
function refreshNewCarList() {
  

  var that = objPage;
  if (that.data.pageEnd) {
    wx.hideToast()
    return;
  }

  var url = CFG.APP_API_HOST + 'Shop/V2/Site/indexSeriesList';

  common.httpRequest(url, {
    data: { count: '15', page: that.data.pageIndex, siteID: CFG.SITE_ID },
    success: function (res) {
      var tick = that.data.pageIndex + 1; // 将请求页面
      that.setData({ pageIndex: tick });

      var statusCode = res.statusCode;
      var list = res.data;
      if (200 == statusCode && undefined !== list.length && list.length > 0) {
        var listCache = that.data.list;
        for (var i in list) {
          // 金额格式化
          list[i].itemOrigPrice = common.formatMoney(list[i].itemOrigPrice);
          list[i].priceRange = common.formatMoney(list[i].priceRange);
          listCache.push(list[i]);
        }
        that.setData({ list: listCache });
      } else {
        that.setData({ pageEnd: true });
      }
    }
  });
}

Page({
  data: { pageIndex: 1, pageEnd: false, list: [] },
  onLoad: function (opt) {
    objPage = this;
    refreshNewCarList();
  },
  onWaterFall: function (e) {
    refreshNewCarList();
  },
  onPullDownRefresh: function (e) {
    wx.stopPullDownRefresh();
  }
})