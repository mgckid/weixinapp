var common = require('../../../utils/util.js')
var CFG = require('../../../utils/config.js')
var objPage = null;

// banner图
function getBanners() {
  var url = CFG.APP_API_HOST + '/Shop/V2/Site/indexBanner';
  common.httpRequest(url, {
    loading: false,
    data: { siteID: CFG.SITE_ID },
    success: function (res) {
      var statusCode = res.statusCode;
      var list = res.data;
      if (!!list.length) {
        objPage.setData({ imgUrls: list });
      }
    }
  })
}


// 资讯列表
function refreshNewsList(page) {
  var url = CFG.APP_API_HOST + 'Shop/V2/Site/indexNewsList';
  common.httpRequest(url, {
    loading: false,
    data: { count: 3, page: 1, siteID: CFG.SITE_ID },
    success: function (res) {
      var statusCode = res.statusCode;
      var shopList = res.data;
      var currentCache = [];

      if (undefined !== shopList && undefined !== shopList.length) {
        var list = [];
        for (var i in shopList) {
          var info = shopList[i];
          var date = info.publishDate;
          shopList[i].date = common.formatDate(date, 'yyyy.MM.d');
        }
        page.setData({ newsList: shopList });
      }
    }
  })
}

// 新车销售列表
function refreshNewCarList(page) {
  
  var url = CFG.APP_API_HOST + 'Shop/V2/Site/indexSeriesList';
  common.httpRequest(url, {
    loading: false,
    data: { count: 3, page: 1, siteID: CFG.SITE_ID },
    pageLoading: true,
    success: function (res) {
      var statusCode = res.statusCode;
      var shopList = res.data;
      var currentCache = [];
      if (undefined !== shopList && undefined !== shopList.length) {
        var list = [];
        for (var i in shopList) {
          var info = shopList[i];
          // 处理金额：
          var originPrice = common.formatMoney(info.itemOrigPrice);
          var priceRange = common.formatMoney(info.priceRange);
          list.push({ brand: info.brand, seriesName: info.seriesName, seriesThumb: info.seriesThumb, originPrice: originPrice, priceRange: priceRange });
        }
        page.setData({ newCarList: list });
      }
    },
    complete: function () {
      objPage.setData({ pageLoading: 'hide' });
    }
  })
}

// 店铺列表
function refreshShops(page) {
  // 发送异步请求
  var url = CFG.APP_API_HOST + 'Shop/V2/Site/indexShopList';
  common.httpRequest(url, {
    data: { count: 5, page: 1, siteID: CFG.SITE_ID },
    success: function (res) {
      var statusCode = res.statusCode;
      var shopList = res.data;
      var currentCache = [];

      if (undefined !== shopList && undefined !== shopList.length) {
        var list = [];
        for (var i in shopList) {
          var info = shopList[i];
          list.push({ shopID: info.shopID, shopPhoto: info.shopPhoto, brandThumb: info.brandThumb, shopTitle: info.shopTitle, promotionList: info.promotionList });
        }
        page.setData({ shopList: list });
      }
    }
  })
}
Page({
  data: {
    imgUrls: [],
    newsList: [],
    newCarList: [],
    shopList: []
  },
  onLoad: function () {
    objPage = this;
    getBanners();
    refreshNewsList(this);
    refreshNewCarList(this);
    refreshShops(this);
  },
  onReady: function () {
    // 页面渲染完成
    wx.hideToast()
  },
  onShow: function () {
    // 页面显示
  },
  onClickWait: function () {
    common.msg('敬请期待 :)');
  },
  onClickInfo: function (opt) {
    var data = opt.currentTarget.dataset;
    var newsType = data.newsType;
    if (10 == newsType) {
      common.msg('小程序暂不支持网页');
      return;
    } else if (40 == newsType) {
      wx.navigateTo({ url: '/pages/shop/news/detail?promotionid=' + data.promotionId })
    } else { // 忘记了newsType...
      // wx.navigateTo({
      //   url: '/pages/shop/recomshop/quote?shopID=' + data.shopId + '&itemID=' + data.itemId,
      // })
      common.msg('小程序暂不支持网页');
      return;
    }
  },
  onPullDownRefresh: function (e) {
    wx.stopPullDownRefresh();
  }

})

