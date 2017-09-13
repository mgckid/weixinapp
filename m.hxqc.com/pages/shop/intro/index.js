// pages/shop/intro/index.js
var common = require('../../../utils/util.js')
var CFG = require('../../../utils/config.js')
var mapTool = require('../../../utils/GPS.js')
var objPage = null;

// 获取公司介绍
function getShopIntro(id){
  var u = CFG.APP_API_HOST + 'Shop/Article/About/index/';
    common.httpRequest(u, {
    pageLoading:true,
    data: { shopID:id,wx:10},
    success: function (res) {
      var statusCode = res.statusCode;
      var info = res.data;
      if (!!info.shopInfo) {
        // 设置坐标
        var lat = info.shopInfo.lat;
        var lng = info.shopInfo.lon;

        // 百度地图转腾讯地图：
        var loc = mapTool.GPS.bd_decrypt(lat, lng);
        lat = loc.lat;
        lng = loc.lon;

        var makers = [{
          alpha: 1,
          id: 0,
          latitude: lat,
          longitude: lng,
          iconPath: '../../../img/global/pos_red.png',
          iconTapPath: '../../../img/global/pos_yellow.png'
        }];
        objPage.setData({ lat: lat, lng: lng ,markers:makers,info:info});
      }else{
        common.msg('店铺信息获取失败')
      }
    }
  })
}

Page({
  data:{
    lat:'',
    lng:'',
    info:'',
    markers: []
  },
  onLoad:function(opt){
    objPage =this;
      var id = opt.shopID
      getShopIntro(id);
  },
  onCall:function (e) {
    common.onCall(e);
  },
  onPullDownRefresh: function (e) {
    wx.stopPullDownRefresh();
  }
})