// pages/shop/news/detail.js
var common = require('../../../utils/util.js')
var CFG = require('../../../utils/config.js')
var objPage = null;

function getPromotionDetail(id) {
  var url = CFG.APP_API_HOST + '/Shop/V2/Promotion';
  common.httpRequest(url, {
    pageLoading: true,
    data: { promotionID: id },
    success: function (res) {
      var statusCode = res.statusCode;
      var info = res.data;
      if (undefined !== info.title) {
        if (!!info.title) {
          wx.setNavigationBarTitle({ title: info.title })
        }
        for (i in info.items) {
          var index = info.items[i];
          index.baseInfo.itemPrice = common.formatMoney(index.baseInfo.itemPrice);
          index.baseInfo.itemFall = common.formatMoney(index.baseInfo.itemFall);
          index.baseInfo.itemOrigPrice = common.formatMoney(index.baseInfo.itemOrigPrice);
        }

        // 判断是促销是否已结束
        const endDate = info.endDate + ' 23:59:59';
        info.expired = common.timeCompare(endDate, '<');

        objPage.setData({ info: info });
      } else {
        common.msg('促销信息不存在');
      }
    },
  })
}

// 点击支付
function onClickPay() {
  var token = wx.getStorageSync('token');
  // 检验是否登录:
  common.checkToken({
    success: function (e) {
      const pData = objPage.data.info;
      var pass = {};
      pass.title = pData.title;
      pass.promotionID = pData.promotionID;
      pass.shopName = pData.shopName;
      pass.shopID = pData.shopID;
      pass.tel = pData.shopInfo.shopTel;
      pass.price = pData.subscription;
      const qStr = common.http_build_query(pass,false);
      wx.navigateTo({
        url: '/pages/shop/news/order?'+qStr,
      })
    }
  });
}

Page({
  data: {
    info: {},
  },
  onLoad: function (options) {
    objPage = this;
    var promotionid = options.promotionid;
    getPromotionDetail(promotionid);

  },
  onClickShop: function (e) {
    var q = e.currentTarget.dataset.query;
    common.goTo('SHOP_INDEX', q);
  },
  onCall: function (e) {
    common.onCall(e);
  },
  onShareAppMessage: function (res) {
    var share = {
      title: this.data.info.title,
      desc: CFG.SHARE_DESC,
      path: '/pages/shop/news/detail?promotionid=' + this.data.info.promotionID
    };
    return share;
  },
  onPullDownRefresh: function (e) {
    wx.stopPullDownRefresh();
  },
  onClickPay: function (e) {
    onClickPay()
  }
})