var common = require('../../../../utils/util.js')
var CFG = require('../../../../utils/config.js')
var objPage = null;
var filter_list_key = {};
var filter_list_name = {};

//获取筛选条件明细数据
function filtrate() {
  var url = CFG.USERDCAR_APP_API_HOST + 'BuyCar/getSearchParam';
  common.httpRequest(
    url, {
      pageLoading: true,
      data: {
        pageParam: 'buyCarPage'
      },
      success: function (res) {
        var statusCode = res.statusCode;   //请求数据返回状态码
        var filtrData = res.data;          //列表数据
        if (200 == statusCode) {
          objPage.setData({ filter: filtrData });
        }
      }
    }
  );
}

//筛选车型数量统计
function buyCarCount(data) {
  var url = CFG.USERDCAR_APP_API_HOST + 'BuyCar/buyCarCount';
  common.httpRequest(
    url, {
      loading: false,
      data: {
        age_limit: data.age_limit ? data.age_limit : '',
        brand: data.brand ? data.brand : '',
        city: data.city ? data.city : '',
        deviceType: data.deviceType ? data.deviceType : '',
        displacement: data.displacement ? data.displacement : '',
        gearbox: data.gearbox ? data.gearbox : '',
        keyword: data.keyword ? data.keyword : '',
        level: data.level ? data.level : '',
        mileage: data.mileage ? data.mileage : '',
        price: data.price ? data.price : '',
        publish_from: data.publish_from ? data.publish_from : ''
      },
      success: function (res) {
        var statusCode = res.statusCode;   //请求数据返回状态码
        var info = res.data;          //列表数据
        if (200 == statusCode && info.total !== undefined) {
          carfiltrCount = info.total;
          objPage.setData({ carCount: carfiltrCount });
        }
      }
    }
  );
}

Page({
  data: {
    switch_price_on: "",
    filter_name_list: null,
    carCount: ''
  },
  onLoad: function (options) {
    objPage = this;
    filtrate();                   //筛选条件
    var data = {};
    if(options) {
      data = options;
    }
    buyCarCount(data);       //筛选车型数量统计

    var filterParams = wx.getStorageSync('filter_param_list');
    if(filterParams) {
      filter_list_key = filterParams.list_key;
      filter_list_name = filterParams.list_name;
    }
    this.setData({
      filter_name_list: filterParams
    });
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onPullDownRefresh:function(){
    wx.stopPullDownRefresh()
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  onClickBack: function (e) {
    //筛选展来效果点击事件
    var ftype = e.currentTarget.dataset.type;
    switch (ftype) {
      case 'price':
        this.setData({
          switch_price_on: "on",
          switch_brand_on: "",
          switch_age_on: "",
          switch_level_on: "",
          switch_source_on: "",
          switch_volume_on: "",
          switch_speed_on: "",
          switch_length_on: ""
        });
        break;
      case 'brand':
        this.setData({
          switch_price_on: "",
          switch_brand_on: "on",
          switch_age_on: "",
          switch_level_on: "",
          switch_source_on: "",
          switch_volume_on: "",
          switch_speed_on: "",
          switch_length_on: ""
        });
        break;
      case 'age_limit':
        this.setData({
          switch_price_on: "",
          switch_brand_on: "",
          switch_age_on: "on",
          switch_level_on: "",
          switch_source_on: "",
          switch_volume_on: "",
          switch_speed_on: "",
          switch_length_on: ""
        });
        break;
      case 'level':
        this.setData({
          switch_price_on: "",
          switch_brand_on: "",
          switch_age_on: "",
          switch_level_on: "on",
          switch_source_on: "",
          switch_volume_on: "",
          switch_speed_on: "",
          switch_length_on: ""
        });
        break;
      case 'publish_from':
        this.setData({
          switch_price_on: "",
          switch_brand_on: "",
          switch_age_on: "",
          switch_level_on: "",
          switch_source_on: "on",
          switch_volume_on: "",
          switch_speed_on: "",
          switch_length_on: ""
        });
        break;
      case 'displacement':
        this.setData({
          switch_price_on: "",
          switch_brand_on: "",
          switch_age_on: "",
          switch_level_on: "",
          switch_source_on: "",
          switch_volume_on: "on",
          switch_speed_on: "",
          switch_length_on: ""
        });
        break;
      case 'gearbox':
        this.setData({
          switch_price_on: "",
          switch_brand_on: "",
          switch_age_on: "",
          switch_level_on: "",
          switch_source_on: "",
          switch_volume_on: "",
          switch_speed_on: "on",
          switch_length_on: ""
        });
        break;
      case 'mileage':
        this.setData({
          switch_price_on: "",
          switch_brand_on: "",
          switch_age_on: "",
          switch_level_on: "",
          switch_source_on: "",
          switch_volume_on: "",
          switch_speed_on: "",
          switch_length_on: "on"
        });
        break;
    }
  },
  onClickHide: function (e) {
    this.setData({
      switch_price_on: "",
      switch_brand_on: "",
      switch_age_on: "",
      switch_level_on: "",
      switch_source_on: "",
      switch_volume_on: "",
      switch_speed_on: "",
      switch_length_on: ""
    });
  },
  onBuyOrder: function (e) {
    //筛选明细点击设计值点击事件
    var fType = e.currentTarget.dataset.type;
    var fvalue = e.currentTarget.dataset.value;
    var fname = e.currentTarget.dataset.text;
    switch (fType) {
      case 'price':
        filter_list_key.price = fvalue;
        filter_list_name.price_name = fname;
        objPage.setData({
          switch_price_on: ""
        });
        break;
      case 'brand':
        filter_list_key.brand = fvalue;
        filter_list_name.brand_name = fname;
        this.setData({ switch_brand_on: "" });
        break;
      case 'age_limit':
        filter_list_key.age_limit = fvalue;
        filter_list_name.age_limit_name = fname;
        this.setData({ switch_age_on: "" });
        break;
      case 'level':
        filter_list_key.level = fvalue;
        filter_list_name.level_name = fname;
        this.setData({ switch_level_on: "" });
        break;
      case 'publish_from':
        filter_list_key.publish_from = fvalue;
        filter_list_name.publish_from_name = fname;
        this.setData({ switch_source_on: "" });
        break;
      case 'displacement':
        filter_list_key.displacement = fvalue;
        filter_list_name.displacement_name = fname;
        this.setData({ switch_volume_on: "" });
        break;
      case 'gearbox':
        filter_list_key.gearbox = fvalue;
        filter_list_name.gearbox_name = fname;
        this.setData({ switch_speed_on: "" });
        break;
      case 'mileage':
        filter_list_key.mileage = fvalue;
        filter_list_name.mileage_name = fname;
        this.setData({ switch_length_on: "" });
        break;
    }
    buyCarCount(filter_list_key);           //根据条件获取车型统计数据
    objPage.setData({ filter_name_list: { "list_key": filter_list_key, "list_name": filter_list_name } });
  },
  onClickSubmit: function (e) {
    //同步设置本地存储筛选条件
    var filterData = { "list_key": filter_list_key, "list_name": filter_list_name };
    wx.setStorageSync('filter_param_list', filterData)   

    //筛选表单提交
    var data = common.http_build_query(filter_list_key);

    //页面跳转传值
    wx.redirectTo({
      url: '/pages/usedcar/buy/index/index?'+ data
    })
  }
})