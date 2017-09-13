// pages/shop/newcar/detail.js
var common = require('../../../utils/util.js')
var CFG = require('../../../utils/config.js')
var objPage = null;
// 获取相关文章
function getInfoList(brand, serie) {
  var url = CFG.APP_API_HOST + '/Info/V2/Index/autoInfoRelevant';
  common.httpRequest(url,{
    data: { brand: brand, series: serie,siteID:CFG.SITE_ID},
    success: function (res) {
      var statusCode = res.statusCode;
      var infoList = res.data;
      if (200 == statusCode && undefined !== infoList.length) {
        objPage.setData({ infoList: infoList });
      } else {
      }
    },
  });
}

// 获取车系详情信息
function getSerieInfo(brand, serie) {
  var url = CFG.APP_API_HOST + '/Shop/V2/Introduce/series';
  common.httpRequest(url,{
    data: { brand: brand, series: serie , siteID : CFG.SITE_ID},
    pageLoading:true,
    success: function (res) {
      var statusCode = res.statusCode;
      var serieInfo = res.data;
      if (200 == statusCode && undefined !== serieInfo.modelList) {
        var sum = 0;
        // 金额格式化：
        serieInfo.seriesInfo.itemOrigPrice = common.formatMoney(serieInfo.seriesInfo.itemOrigPrice);
        serieInfo.seriesInfo.priceRange = common.formatMoney(serieInfo.seriesInfo.priceRange);
        for(var i in serieInfo.modelList){
          sum += serieInfo.modelList[i].model.length;
           for(var j in serieInfo.modelList[i].model){
              serieInfo.modelList[i].model[j].priceRange = common.formatMoney(serieInfo.modelList[i].model[j].priceRange);
              serieInfo.modelList[i].model[j].itemOrigPrice = common.formatMoney(serieInfo.modelList[i].model[j].itemOrigPrice);
           }
        }
        wx.setNavigationBarTitle({title: serieInfo.seriesInfo.seriesName})
        objPage.setData({ serieInfo: serieInfo ,serieSum:sum});
      } else {
        common.msg('车系详情为空');
      }
    },
  });
}
Page({
  data: {
    serieSum:0,
    brand: '',
    serie: '',
    shopSiteFrom: '',
    serieInfo: {},
    infoList: [],
    cansLay_display: 'display:none',
    mask_display: 'display:none',
    pageLoading:'',
  },
  onLoad: function (options) {
    objPage = this;
    this.setData({ brand: options.brand, serie: options.serie });
    getSerieInfo(options.brand, options.serie);
    getInfoList(options.brand, options.serie);

  },
  onClickShow: function () {
    objPage.setData({ cansLay_display: 'display:block',mask_display: 'display:block'  });
  },
  onClickHide: function () {
    objPage.setData({ cansLay_display: 'display:none',mask_display: 'display:none'  });
  },
  onCall: function (e) {
     common.onCall(e);
  },
  onClickShop:function(e){
    var q = e.currentTarget.dataset.query;
    common.goTo('SHOP_INDEX',q);
  },
  onShareAppMessage: function () {
    return {
      title: this.data.serie,
      desc: CFG.SHARE_DESC,
      path: '/pages/shop/newcar/detail?brand=' + this.data.brand + '&serie=' + this.data.serie
    }
  },
  onPullDownRefresh: function (e) {
    wx.stopPullDownRefresh();
  }
})
