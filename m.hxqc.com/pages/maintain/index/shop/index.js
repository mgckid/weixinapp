var common = require('../../../../utils/util.js')
var CFG = require('../../../../utils/config.js')
var mapTool = require('../../../../utils/GPS.js');
var objPage = null;

// 获取保养店铺列表
function refreshShopList() {
  var url = CFG.MAINTAIN_APP_API_HOST + 'Filter/shopN2';
  var that = objPage;
  var pData = objPage.data;
  var area_i = pData.area_i;
  if (that.data.newsEnd) {
    return;
  }
  var tick = that.data.newsIndex + 1;
  that.setData({ newsIndex: tick });
  var area = '', province='';
  if('全部城区'!= area_i){
    province = '湖北省' ;
    area ='武汉市';
  }else{
    area_i = '';
  }

  var gets = { count: 15, page: tick, area: area, autoModelID: that.data.modelID, brandID: that.data.brandID, district: area_i, items: that.data.items, latitude: that.data.lat, longitude: that.data.lng, myAutoID: '', province: province, seriesID: that.data.serieID, shopType: 10, sort: 50, token: '' };// 遇到参数值是json对象的一定要转换成字符串
  common.httpRequest(url, {
    pageLoading: true,
    data: gets,
    success: function (res) {
      var statusCode = res.statusCode;
      var list = res.data;
      var cache = pData.list;
      if (200 == statusCode && 'object' ==  typeof list &&  undefined!== list.length && list.length) {
        for (var i in list) {
          list[i].distance = common.formatDistance(list[i].distance);
          cache.push(list[i]);
        }
        that.setData({ list: cache });
      } else {
        that.setData({ newsEnd: true });
      }
    }
  });
}

function filterHide(){
  objPage.setData({areaShow:'',distanceShow:'',maskShow:''});
}

Page({
  data: {
    area_i:'全部城区',
    area_ls:['全部城区','江岸区','武昌区','江汉区','硚口区'],
    sort_mixed_i:0,
    sort_mixed:[{v:50,t:'距离最近'},{v:30,t:'价格最低'}],
    sort:50,
    brandID: '',
    serieID: '',
    modelID: '',
    distance:10,
    newsEnd: false,
    newsIndex: 0,
    lat: CFG.WUHAN_LAT,
    lng: CFG.WUHAN_LNG,
    items: {},
    itemsJSON:'',
    list: [],
    areaShow:'',
    distanceShow:'',
    maskShow:''
  },
  onLoad: function (opt) {
    objPage = this;
    var sets = {};
    sets.brandID = opt.brandID;
    sets.serieID = opt.serieID;
    sets.modelID = opt.modelID;
    sets.distance = opt.distance;
    sets.items = JSON.parse(opt.itemJSON);
    sets.itemsJSON = opt.itemJSON;

    objPage.setData(sets);
    common.showLoading('定位中');
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        common.showSuccess('定位成功');
        var latitude = res.latitude
        var longitude = res.longitude
        var loc = mapTool.GPS.bd_encrypt(latitude, longitude);
        latitude = loc.lat;
        longitude = loc.lon;
        objPage.setData({ lat: latitude, lng: longitude });
      },
      fail: function (e) {
        common.msg('定位失败');
      },
      complete: function (e) {
        refreshShopList();
      }
    })
  },
  filter:function(e){
    var filter = e.currentTarget.dataset.filter;
    switch(filter){
      case 'area':
        this.setData({areaShow:'on',distanceShow:'',maskShow:'on'});
        break;
      case 'distance':
        this.setData({areaShow:'',distanceShow:'on',maskShow:'on'});
        break;
    }
  },
  filterHide:function(){
    filterHide()
  },
  onClickArea:function(e){
    var area = e.currentTarget.dataset.area;
    this.setData({area_i:area,list:[],newsEnd:false,newsIndex:0});
    filterHide()
    refreshShopList();
  },
  onClickSortMixed:function(e){
    var i = e.currentTarget.dataset.i;
    this.setData({sort_mixed_i:i,list:[],newsEnd:false,newsIndex:0});
    filterHide()
    refreshShopList();
  },
  onPullDownRefresh: function (e) {
    wx.stopPullDownRefresh();
  }
})