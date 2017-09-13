var common = require('../../../utils/util.js')
var CFG = require('../../../utils/config.js')
var mapTool = require('../../../utils/GPS.js')
var objPage = null;
var shopID = '';
function getPromotionList(shopID) {
  if (objPage.data.pageEnd) {
    wx.hideToast()
    return;
  }

  var url = CFG.APP_API_HOST + '/Shop/V2/Promotion/promotionList2';
  common.httpRequest(url, {
    pageLoading:true,
    data: { count: 15, page: objPage.data.pageIndex, shopID: shopID },
    success: function (res) {
      var tick = objPage.data.pageIndex + 1; // 将请求页面
      objPage.setData({ pageIndex: tick });

      var statusCode = res.statusCode;
      var list = res.data;
      if (undefined !== list.length && list.length) {
        var cache = objPage.data.newList;
        for (var i in list) {
          var date = list[i].publishDate;
          const endDate = list[i].endDate + ' 23:59:59';  
          const startDate = list[i].startDate + ' 00:00:00';
          list[i].expired =  common.timeCompare(endDate,'<');
          list[i].publishDate = common.formatDate(date, 'yyyy-MM-dd');
          list[i].diffDays = common.diffDays(endDate);
          cache.push(list[i]);
        }
        objPage.setData({ newList: cache });

      } else {
        objPage.setData({ pageEnd: true });
      }
    }
  })
}

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
    }
  })
}
Page({
  data: {
    layer_on: '',//黑色背景图层
    menu_showClass: '',
    pageIndex: 0, pageEnd: false, newList: []
  },
  onLoad: function (options) {
    objPage = this;
    shopID = options.shopID;
    getPromotionList(shopID);
    getShopInfo(shopID);
  },
  menu_show: function () {
    if (this.data.menu_showClass === '') {
      this.setData({ menu_showClass: 'open' })
    } else {
      this.setData({ menu_showClass: '' })
    }
  },
  onWaterFall: function () {
    getPromotionList(shopID);
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