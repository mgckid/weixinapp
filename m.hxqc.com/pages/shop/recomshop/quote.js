// pages/shop/recomshop/quote.js
var common = require('../../../utils/util.js')
var CFG = require('../../../utils/config.js')
var mapTool = require('../../../utils/GPS.js');
var objPage = null;

// 获取车型详情
function getAutoDetail(shopID, itemID) {
  var url = CFG.APP_API_HOST + '/Shop/V2/Auto/itemDetail';
  common.httpRequest(url, {
    pageLoading:true,
    data: { itemID: itemID, shopID: shopID },
    success: function (res) {
      var statusCode = res.statusCode;
      var info = res.data;
      if (undefined !== info.shopInfo) {
        var title = info.shopInfo.shopTitle;
        wx.setNavigationBarTitle({
          title: title
        })
        //价格处理
        var baseInfo = info.baseInfo;
        baseInfo.itemPrice = common.formatMoney(baseInfo.itemPrice);
        baseInfo.itemTotalPrice = common.formatMoney(baseInfo.itemTotalPrice);
        objPage.setData({ info: info });
      } else {
        common.msg('未获取到车型详情');
      }
    }
  })
}

Page({
  data: {
    carImg_on: 'on',
    maskShow: ''
  },
  onLoad: function (options) {
    objPage = this;
    var shopID = options.shopID;
    var itemID = options.itemID;
    getAutoDetail(shopID, itemID);
  },
  //显示隐藏
  carImg_show: function () {
    if (this.data.carImg_on === 'on') {
      this.setData({ carImg_on: '' })
    } else {
      this.setData({ carImg_on: 'on' })
    }
  },
  maskShow: function () {
    this.setData({ maskShow: 'on' })
  },
  maskHide: function () {
    this.setData({ maskShow: '' })
  },
  onNav: function (e) {
      var lat = e.currentTarget.dataset.lat;
      var lng = e.currentTarget.dataset.lng;
      var loc = mapTool.GPS.bd_decrypt(lat,lng);
      lat = loc.lat;
      lng = loc.lon;
      
      wx.openLocation({
        latitude: lat,
        longitude: lng,
        scale: 14
      })
    },
  onPullDownRefresh: function (e) {
    wx.stopPullDownRefresh();
  }
})