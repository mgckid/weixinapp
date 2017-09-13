// pages/shop/newcar/sale.js
var common = require('../../../utils/util.js')
var CFG = require('../../../utils/config.js')
var objPage = null;

// 获取车型详情
function getModelDetail(brand, extID, model) {
  var url = CFG.APP_API_HOST + '/Shop/V2/Introduce/model';
  common.httpRequest(url,{
    data: { brand: brand, extID: extID, model: model , siteID : CFG.SITE_ID},
    success: function (res) {
      var statusCode = res.statusCode;
      var modelInfo = res.data;
      if (200 == statusCode && undefined !== modelInfo.modelInfo) {
          var modelData = modelInfo.modelInfo;
          //只对json数据里的价格处理
          var priceRange = common.formatMoney(modelData.priceRange);
          var itemOrigPrice = common.formatMoney(modelData.itemOrigPrice);
          modelData.priceRange = priceRange;
          modelData.itemOrigPrice = itemOrigPrice;
          objPage.setData({info:modelInfo});
      } else {
      }
    }
  });
}


Page({
  data: {
    carImg_on: 'on',
    carInfo_on: 'on',
    maskShow: '',
    index: 0,
  },
  onLoad: function (options) {
     objPage = this;
     var brand = options.brand;
     var extID = options.extID;
     var model = options.model;
     getModelDetail(brand,extID,model);
  },
  //显示隐藏
  carImg_show: function () {
    if (this.data.carImg_on === 'on') {
      this.setData({ carImg_on: '' })
    } else {
      this.setData({ carImg_on: 'on' })
    }
  },
  carInfo_show: function () {
    if (this.data.carInfo_on === 'on') {
      this.setData({ carInfo_on: '' })
    } else {
      this.setData({ carInfo_on: 'on' })
    }
  },
  maskShow: function () {
    this.setData({ maskShow: 'on' })
  },
  maskHide: function () {
    this.setData({ maskShow: '' })
  },
  bindPickerChange: function (e) {
    this.setData({
      index: e.detail.value
    })
  },
  onClickShop:function(e){
    var q = e.currentTarget.dataset.query;
    common.goTo('SHOP_INDEX',q);
  },
  onPullDownRefresh: function (e) {
    wx.stopPullDownRefresh();
  }
})