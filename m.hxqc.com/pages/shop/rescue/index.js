var CFG = require('../../../utils/config.js');
var common = require('../../../utils/util.js');
var mapTool = require('../../../utils/GPS.js');
var objPage = null;

Page({
  data: {
    address: '定位中...',
    listIndex: 0,
    listCount: '10',
    list: [],
    brandList: [],
    listEnd: false,
    pro: '',
    city: '',
    area: '',
    info: '',
    address: '',
    latitude: '35.867322',
    longitude: '104.204598',
    trueBrandName: '不限',
    pageLoading: ''
  },
  onLoad: function (options) {
    objPage = this;
    common.showLoading('定位中');
    // 获取坐标
    wx.getLocation({
      type: 'wgs84 ',
      success: function (res) {
        common.showSuccess('定位成功');
        var latitude = res.latitude
        var longitude = res.longitude
   
        common.getAddrByPos({ lng: longitude, lat: latitude, handler: objPage });
        objPage.setData({ latitude: latitude, longitude: longitude });
      },
      fail: function (e) {
        objPage.setData({ address: '定位失败' });
        common.msg('定位失败');
      },
      complete: function () {
        ajaxGetInfo('');
      }
    })

    getBrands();
  },
  onWaterFall: function () {
    ajaxGetInfo('');
  },
  call: function (e) {
    var num = e.currentTarget.dataset.num;
    wx.makePhoneCall({
      phoneNumber: num
    })
  },
  // 侧滑
  sidesFixedShow: function () {
    this.setData({ sidesMask_show: 'on', sidesFixed_show: 'on' })
  },
  sidesFixedHide: function (e) {
    var value = e.currentTarget.dataset.value;
    this.setData({ sidesMask_show: '', sidesFixed_show: '', trueBrandName: value, listIndex: 0 });
    ajaxGetInfo(value);
  },
  rescuesend: function () {
    wx.makePhoneCall({
      phoneNumber: '400-1868-555'
    })
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
  onClickShop:function(e){
    var q = e.currentTarget.dataset.query;
    common.goTo('SHOP_INDEX',q);
  },
  onPullDownRefresh: function (e) {
    wx.stopPullDownRefresh();
  }
})

function ajaxGetInfo(brand) {
  var tick = objPage.data.listIndex + 1;
  objPage.setData({ listIndex: tick });

  var listCount = objPage.data.listCount;
  var lat = objPage.data.latitude;
  var lon = objPage.data.longitude;
  currentCache = objPage.data.list;
  var data = { latitude: lat, longitude: lon, count: listCount, page: tick };
  if (brand != '' && brand != '不限') {
    data['brand'] = brand;
  }
  var url = CFG.MAINTAIN_APP_API_HOST + '/Filter/rescueShop';
  common.httpRequest(url, {
    data: data,
    loading:true,
    pageLoading:true,
    success: function (res) {
      var statusCode = res.statusCode;
      var infoList = res.data;
      var currentCache = [];
      currentCache = objPage.data.list;
      if (brand) {
        currentCache = [];
      }
      if (200 == statusCode && infoList.length) {
        for (var i in infoList) {
          var r = infoList[i];
          var distance = common.formatDistance(r.distance);
          var shopTitle = r.shopTitle;
          var address = r.shopPoint.address;
          var tel = r.shopPoint.tel;

          currentCache.push({ shopID: r.shopID, shopTitle: shopTitle, shopImgUrl: r.shopImgUrl, address: address, distance: distance, tel: tel, brandThumb: r.brandThumb ,lat:r.shopPoint.latitude,lng:r.shopPoint.longitude});
        }
        objPage.setData({ list: currentCache });
      } else {
        objPage.setData({ listEnd: true });
      }
    },
    complete: function () {
      objPage.setData({ pageLoading: 'hide' });
    }
  })
}

// 获取品牌列表
function getBrands() {
  var url = CFG.APP_API_HOST + 'Shop/V2/Filter/filterAutoBrand';
  common.httpRequest(url, {
    data: { 'type': '10' },
    success: function (res) {
      var statusCode = res.statusCode;
      var brandList = res.data;
      var currentCache = [];
      if (200 == statusCode && !!brandList.length) {
        objPage.setData({ brandList: brandList });
      } else {
       common.msg('品牌列表为空');
      }
    }
  })
}
