var common = require('../../../utils/util.js')
var CFG = require('../../../utils/config.js')
var bmap = require('../../../utils/baidu/api.min.js'); // 百度地图插件
var mapTool = require('../../../utils/GPS.js');
var objPage = null;

function getShopInfo(shopID) {
  var url = CFG.APP_API_HOST + 'Shop/V2/Shop';
  common.httpRequest(url, {
    data: { shopID: shopID },
    pageLoading: true,
    success: function (res) {
      var statusCode = res.statusCode;
      var info = res.data;
      if (undefined !== info.series) {
        var title = info.shopInfo.shopTitle;
        wx.setNavigationBarTitle({
          title: title
        })
        var lat = info.shopInfo.shopLocation.latitude;
        var lng = info.shopInfo.shopLocation.longitude;

        // 百度地图转腾讯地图：
        var loc = mapTool.GPS.bd_decrypt(lat, lng);
        lat = loc.lat;
        lng = loc.lon;

        // 设置店铺坐标
        var makers = [{
          alpha: 1,
          id: 0,
          latitude: lat,
          longitude: lng,
          iconPath: '../../../img/global/pos_red.png',
          iconTapPath: '../../../img/global/pos_yellow.png'
        }];
        objPage.setData({ latitude: lat, longitude: lng });
        for (i in info.items) {
          //价格处理
          var index = info.items[i];
          index.itemPrice = common.formatMoney(index.itemPrice);
          index.itemOrigPrice = common.formatMoney(index.itemOrigPrice);
        }
        objPage.setData({ info: info, markers: makers });
      } else {
        common.msg('未获取到车系信息');
      }
    },
    complete: function () {
      objPage.setData({ pageLoading: 'hide' });
    }
  })
}

Page({
  data: {
    info: {}, shopID: '',
    markers: [],
    latitude: '',
    longitude: '',
    rgcData: {},
    pageLoading: ''
  },
  onLoad: function (options) {
    objPage = this;
    var shopID = options.shopID;
    this.setData({ shopID: shopID });
    getShopInfo(shopID);
  },
  makertap: function (e) {
    var that = this;
    var id = e.markerId;
    that.showSearchInfo(wxMarkerData, id);
  },
  showSearchInfo: function (data, i) {
    var that = this;
    that.setData({
      rgcData: {
        address: '地址：' + data[i].address + '\n',
        desc: '描述：' + data[i].desc + '\n',
        business: '商圈：' + data[i].business
      }
    });
  },
  onReady: function () {
    this.mapCtx = wx.createMapContext('map');
  },
  onCall: function (e) {
    common.onCall(e);
  },
  moveToLocation: function (e) {
    common.showLoading('定位中');

    this.mapCtx.getCenterLocation({
      success: function (res) {
        common.hideLoading();
        objPage.mapCtx.moveToLocation()
      }, fail: function (res) {
        common.msg('定位失败');
        common.hideLoading();
      }})
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
