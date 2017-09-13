var common = require('../../../utils/util.js')
var CFG = require('../../../utils/config.js')
//获取应用实例
var searchModel = ['店铺', '车型']
var objPage = null;

function getBrandList() {
  var page = objPage;
  var url = CFG.APP_API_HOST + 'Shop/V2/Filter/filterAutoBrand';
  common.httpRequest(url, {
    loading:false,
    data: { siteID: CFG.SITE_ID },
    success: function (res) {
      var data = res.data;
      if (undefined !== data.length) {
        var list = ['不限'];
        for (var i in data) {
          var ele = data[i];
          var groupName = ele.groupTag;
          var eleList = ele.group;
          for (var j in eleList) {
            var brand = eleList[j].brandName;
            list.push(brand);
          }
        }
        page.setData({ brandList: list });
      }
    }
  })
}

function getSerieList() {
  var page = objPage;
  var url = CFG.APP_API_HOST + 'Shop/V2/Filter/filterAutoSeries';
  var brandIndex = page.data.brandIndex;
  var brandList = page.data.brandList;
  var brand = 0 == brandIndex ? '' : brandList[brandIndex];
  var data = { brand: brand, siteID: CFG.SITE_ID }

  if (0 == brandIndex) {
    var list = ['不限'];
    page.setData({ serieList: list });
    return;
  }
  common.httpRequest(url, {
    loading:false,
    data: data,
    success: function (res) {
      var firstList = res.data[0];
      if (undefined !== firstList && undefined !== firstList.series) {
        var series = firstList.series;
        var list = ['不限'];
        for (var i in series) {
          list.push(series[i].seriesName);
        }
        page.setData({ serieList: list });
      }
    },
    fail: function () {
      var list = ['不限'];
      page.setData({ serieList: list });
    }
  })
}

function getShopList() {
  var page = objPage;
  var keyword = page.data.keyword;
  var pageIndex = page.data.pageIndex;
  var brandIndex = page.data.brandIndex;
  var brandList = page.data.brandList;
  var serieIndex = page.data.serieIndex;
  var serieList = page.data.serieList;

  var brand = 0 == brandIndex ? '' : brandList[brandIndex];
  var serie = 0 == serieIndex ? '' : serieList[serieIndex];
  var data = { brand: brand, page: pageIndex, count: 15, keyword: keyword, latitude: 30.553759, longitude: 114.210785, siteID: CFG.SITE_ID }
  if ('' !== serie) {
    data.series = serie;
  }
  var url = CFG.APP_API_HOST + 'Shop/V2/Site/searchShopList';
  common.httpRequest(url,{
    data: data,
    pageLoading:true,
    success: function (res) {
      var data = res.data;
      if (undefined !== data.length) {
        if (data.length > 0) {
          pageIndex = pageIndex + 1;
          page.setData({ pageIndex: pageIndex });
        }
        var list = page.data.shopList;
        for (var i in data) {
          var info = data[i];
          list.push({ shopID: info.shopID, shopPhoto: info.shopPhoto, brandThumb: info.brandThumb, shopTitle: info.shopTitle, promotionList: info.promotionList });
        }
        page.setData({ shopList: list });
      }
    }
  })
}

Page({
  data: {
    pageIndex: 1,
    keyword: '',
    brandIndex: 0,
    brandList: ['不限'],
    serieIndex: 0,
    serieList: ['不限'],
    shopList: [],
    pageLoading:'',
    searchModel: searchModel,
    searchType: 0
  },
  onLoad: function (option) {
    objPage = this;
    getBrandList();
    getShopList();
  },
  bindPickerModel: function (e) {
    this.setData({ searchType: e.detail.value })
  },
  ddlSelBrand: function (e) {
    this.setData({ brandIndex: e.detail.value, pageIndex: 1,serieIndex:0, shopList: [] });
    getSerieList(this);
    getShopList(this);
  },
  ddlSelSerie: function (e) {
    this.setData({ serieIndex: e.detail.value, pageIndex: 1, shopList: [] });
    getShopList(this);
  },
  onWaterFall: function () {
    getShopList(this);
  },
  btnSearch: function (e) {
    var keyword = e.detail.value.keyword;
    this.setData({ keyword: keyword, pageIndex: 1, shopList: [] });
    getShopList(this);
  },
  onClickShop:function(e){
    var q = e.currentTarget.dataset.query;
    common.goTo('SHOP_INDEX',q);
  },
  onPullDownRefresh: function (e) {
    wx.stopPullDownRefresh();
  }
})
