// pages/shop/news/news.js
var common = require('../../../utils/util.js')
var CFG = require('../../../utils/config.js')
var objPage = null;

function getNewsList() {
  
  if (objPage.data.pageEnd) {
    wx.hideToast()
    return;
  }

  var url = CFG.APP_API_HOST + 'Shop/V2/Site/indexNewsList';
  common.httpRequest(url, {
    data: { count: 15, page: objPage.data.pageIndex, siteID: CFG.SITE_ID },
    success: function (res) {
      var tick = objPage.data.pageIndex + 1; // 将请求页面
      objPage.setData({ pageIndex: tick });
      var statusCode = res.statusCode;
      var list = res.data;
      if (undefined !== list.length && list.length) {
        var cache = objPage.data.newList;
        for (var i in list) {
          var date = list[i].publishDate;
          list[i].publishDate = common.formatDate(date, 'yyyy-MM-dd');
          cache.push(list[i]);
        }
        objPage.setData({ newList: cache });
      } else {
        objPage.setData({ pageEnd: true });
      }
    },
  })
}
Page({
  data: { pageIndex: 0, pageEnd: false, newList: [] },
  onLoad: function (options) {
    objPage = this;
    getNewsList();
  },
  onShow: function () {
  },
  onWaterFall: function () {
    getNewsList();
  },
  onClickInfo: function (opt) {
    var data = opt.currentTarget.dataset;
    var newsType = data.newsType;
    if (10 == newsType) {
      common.msg('小程序暂不支持网页');
      return;
    } else if (40 == newsType) {
      wx.navigateTo({
        url: '/pages/shop/news/detail?promotionid=' + data.promotionId
      })
    } else {
      wx.navigateTo({
        url: '/pages/shop/recomshop/quote?shopID=' + data.shopId + '&itemID=' + data.itemId,
      })
    }
  },
  onPullDownRefresh: function (e) {
    wx.stopPullDownRefresh();
  }
})