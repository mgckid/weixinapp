// pages/shop/recomshop/shop-quotation.js # 车型报价
var common = require('../../../utils/util.js')
var CFG = require('../../../utils/config.js')
var mapTool = require('../../../utils/GPS.js');
var objPage = null;
var shopID = '';

// 获取店铺信息
function getShopInfo(shopID) {
  var url = CFG.APP_API_HOST + 'Shop/V2/Shop';
  common.httpRequest(url, {
    loading:false,
    data: { shopID: shopID },
    success: function (res) {
      var statusCode = res.statusCode;
      var info = res.data;
      if (undefined !== info.series) {
        var title = info.shopInfo.shopTitle;
        wx.setNavigationBarTitle({
          title: title
        })
        objPage.setData({ info: info });
      } else {
        common.msg('未获取到店铺信息');
      }
    },
  })
}

// 获取车系信息
function getSeries(shopID) {
  var url = CFG.APP_API_HOST + 'Shop/V2/Auto/series';
  common.httpRequest(url, {
    pageLoading:true,
    data: { shopID: shopID },
    success: function (res) {
      var statusCode = res.statusCode;
      var info = res.data;
      if (undefined !== info.length) {
        // 价格处理
        for (i in info) {
          var index = info[i].series;
          for (j in index) {
            index[j].priceRange = common.formatMoney(index[j].priceRange);
          }
        }
        objPage.setData({ series: info });
      } else {
        common.msg('未获取到车系信息');
      }
    }
  })
}


// 获取车型列表
function getModelList(shopID, serieID) {
  var url = CFG.APP_API_HOST + '/Shop/V2/Auto/items';
  common.httpRequest(url, {
    data: { shopID: shopID, seriesID: serieID },
    success: function (res) {
      var statusCode = res.statusCode;
      var info = res.data;
      if (undefined !== info.length) {
        for (i in info) {
          info[i].itemPrice = common.formatMoney(info[i].itemPrice);
          info[i].itemOrigPrice = common.formatMoney(info[i].itemOrigPrice);
        }
        objPage.setData({ modelList: info });
      } else {
        common.msg('未获取到车型列表');
      }
    }
  })
}

Page({
  data: {
    layer_on: '',//黑色背景图层
    menu_showClass: '',
    switch_filter: '',
    current_serieName: '',
    current_serieIMG: '',
    current_seriePriceRange: '',
    series: {},
    modelList: [],
    shopID: ''
  },
  onLoad: function (options) {
    objPage = this;
    shopID = options.shopID;
    this.setData({ shopID: shopID });
    getShopInfo(shopID);
    getSeries(shopID);
  },
  menu_show: function () {
    if (this.data.menu_showClass === '') {
      this.setData({ menu_showClass: 'open' })
    } else {
      this.setData({ menu_showClass: '' })
    }
  },
  showFilter: function (e) {
    var dataset = e.currentTarget.dataset;
    var serieName = dataset.serieName;
    var serieID = dataset.serieId;
    var serieIMG = dataset.serieImg;
    var seriePriceRange = dataset.seriePriceRange;

    this.setData({ current_serieName: serieName, current_serieIMG: serieIMG, current_seriePriceRange: seriePriceRange });

    getModelList(shopID, serieID);
    this.setData({ switch_filter: 'open', layer_on: 'on' });
  },
  closeFilter: function (e) {
    this.setData({ layer_on: '', switch_filter: '' });
  },
  stopPass: function () {
  },
  onNav: function (e) {
    var lat = e.currentTarget.dataset.lat;
    var lng = e.currentTarget.dataset.lng;
    var loc = mapTool.GPS.bd_decrypt(lat, lng);
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