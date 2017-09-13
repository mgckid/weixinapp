// map.js
var mapTool = require('../../utils/GPS.js');
Page({
  data: {
    lat: '',
    lng: '',
    markers: []
  },
  onLoad: function (opt) {
    var title = !!opt.title?opt.title:'地图导航';
    wx.setNavigationBarTitle({title:title})
    var sets = {};
    // 百度坐标转腾讯地图
    var loc = mapTool.GPS.bd_decrypt(opt.lat, opt.lng);
    sets.lat = loc.lat;
    sets.lng = loc.lon;
    sets.markers = [{
      alpha: 1,
      id: 0,
      latitude: sets.lat,
      longitude: sets.lng,
      iconPath: '../../img/global/pos_red.png',
      iconTapPath: '../../img/global/pos_red.png'
    }];
    this.setData(sets);
  },
  onNav:function(e){
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
    }
})