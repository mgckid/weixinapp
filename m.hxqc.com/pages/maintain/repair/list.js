// pages/maintain/repair/list.js
var common = require('../../../utils/util.js')
var CFG = require('../../../utils/config.js')
var mapTool = require('../../../utils/GPS.js');
var token = '';
var mobile = '';
var objPage = null;

function refreshShopList() {
  var that = objPage;
  var modelInfo = objPage.data.default_model;
  if (that.data.newsEnd) {
    return;
  }
  var tick = that.data.newsIndex + 1;
  that.setData({ newsIndex: tick });
  // 发送异步请求
  var url = CFG.MAINTAIN_APP_API_HOST + 'Filter/reservationShop';
  common.httpRequest(url, {
    pageLoading: true,
    data: { count: 20, page: tick, brand: modelInfo.subBrand, series: modelInfo.serieName, latitude: objPage.data.lat, longitude: objPage.data.lng },
    success: function (res) {
      var statusCode = res.statusCode;
      var shopList = res.data;
      var currentCache = [];
      if (200 == statusCode && shopList.length) {
        // 格式化距离为KB
        for (var i in shopList) {
          var distance = shopList[i].distance;
          distance = Math.ceil(distance/100)/10+'km';
          shopList[i].distance = distance;
        }
        that.setData({ shopList: shopList });
      } else {
        // 标识最后一页
        that.setData({ newsEnd: true });
      }
    }
  });
}

Page({
  data: {
    default_model: {},
    newsEnd: false,
    newsIndex: 0,
    lat: '30.553732',
    lng: '114.210808',
    shopList: []
  },
  onLoad: function (opt) {
    objPage = this;
    // 获取缓存：
    var k = 'maintain_repair_default_model_info';
    var default_model = wx.getStorageSync(k);
    if (undefined !== default_model && undefined !== default_model.brandName) {
      objPage.setData({ default_model: default_model });
    } else {
      common.msg('车型缓存信息为空!');
      return;
    }

    common.showLoading('定位中');
    // 获取坐标：
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        common.showSuccess('定位成功');
        var latitude = res.latitude
        var longitude = res.longitude

        // 坐标转换为百度
        var loc = mapTool.GPS.bd_encrypt(latitude, longitude);
        latitude = loc.lat;
        longitude = loc.lon;
        objPage.setData({ lat: latitude, lng: longitude });
      },
      fail: function (e) {
        common.msg('定位失败');
        // 定位失败使用默认坐标
      },
      complete: function (e) {
        refreshShopList();
      }
    })
  },
  onWaterFall: function (e) {
    refreshShopList();
  },
  onPullDownRefresh: function (e) {
    wx.stopPullDownRefresh();
  }
})