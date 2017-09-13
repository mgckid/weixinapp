// pages/shop/newcar/index.js
var common = require('../../../utils/util.js')
var CFG = require('../../../utils/config.js')
var objPage = null;

// 获取品牌列表
function getBrands() {
  
  var url = CFG.APP_API_HOST + '/Shop/V2/Filter/filterAutoBrand';
  common.httpRequest(url, {
    data: { siteID: CFG.SITE_ID },
    success: function (res) {
      var statusCode = res.statusCode;
      var brandList = res.data;
      var currentCache = [];
      if (200 == statusCode && brandList.length) {
        objPage.setData({ brandList: brandList });
      } else {
        common.msg('品牌列表为空');
      }
    },
  })

}

// 获取车系列表
function getSeries(brand) {
  var url = CFG.APP_API_HOST + '/Shop/V2/Filter/filterAutoSeries';
  common.httpRequest(url, {
    data: { brand: brand, siteID: CFG.SITE_ID },
    success: function (res) {
      var statusCode = res.statusCode;
      var serieList = res.data;
      var currentCache = [];
      if (200 == statusCode && undefined !== serieList.length) {
        // 价格格式化：
        for (var i in serieList) {
          for (var j in serieList[i].series) {
            serieList[i].series[j].itemOrigPrice = common.formatMoney(serieList[i].series[j].itemOrigPrice);
            serieList[i].series[j].priceRange = common.formatMoney(serieList[i].series[j].priceRange);
          }
        }
        objPage.setData({ serieList: serieList });
        // objPage.setData({com_slide_display: 'display:block'});
        objPage.setData({ switch_slide_on: 'on' });
      } else {
        common.msg('车系列表为空');
      }

    },
  })
}
Page({
  data: {
    brandList: [],
    switch_slide_on: ''
  },
  onLoad: function (options) {
    objPage = this;
    getBrands();
  },
  onClickBrand: function (e) {
    // 点击品牌
    var brand = e.currentTarget.dataset.brand;

    if (brand) {
      this.setData({ serieList: [] });
      // 获取车系列表
      getSeries(brand);
    } else {
     common.msg('请选择品牌');
    }
  },
  stopPass: function (e) {
  },
  onPullDownRefresh: function (e) {
    wx.stopPullDownRefresh();
  }
})