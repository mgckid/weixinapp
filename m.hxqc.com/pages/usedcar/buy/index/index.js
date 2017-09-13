var common = require('../../../../utils/util.js')
var CFG = require('../../../../utils/config.js')
var objPage = null;
var filterList = { order_key: '', order_value: "" };
var filter_teg = { price_test: '', brand_test: '' };
var filter_param_list = { list_key: {}, list_name: {} };
var brandList = {};

//加载买二手车列表数据
function loadInfoList(data) {
  if (objPage.data.carEnd) {
    return;
  }
  var tick = objPage.data.carIndex + 1;
  objPage.setData({ carIndex: tick });

  // 发送异步请求
  var url = CFG.USERDCAR_APP_API_HOST + 'BuyCar/buyCarlist';
  var price = data.list_key.price;
  var brand = data.list_key.brand;

  common.httpRequest(
    url, {
      pageLoading: true,
      data: {
        price: price ? price : '',
        brand: brand ? brand : '',
        age_limit: data.age_limit ? data.age_limit : '',
        level: data.level ? data.level : '',
        publish_from: data.list_key.publish_from ? data.list_key.publish_from : '',
        displacement: data.list_key.displacement ? data.list_key.displacement : '',
        gearbox: data.list_key.gearbox ? data.list_key.gearbox : '',
        mileage: data.list_key.mileage ? data.list_key.mileage : '',
        page_size: 15,
        order_key: filterList.order_key,
        order_value: filterList.order_value,
        page: tick
      },
      success: function (res) {
        var statusCode = res.statusCode;   //请求数据返回状态码
        var carList = res.data.data;       //列表数据
        var currentCache = [];
        currentCache = objPage.data.buyCarList;

        if (200 == statusCode && undefined !== carList && carList.length > 0) {
          for (var i in carList) {
            var r = carList[i];
            var first_on_card = common.formatDate(r.first_on_card, 'Y年');
            var publish_from = r.publish_from;
            var detailUrl = null;
            if (publish_from == 2) {           //自营
              detailUrl = 'detail-person';
            } else {    //认证
              detailUrl = 'detail-auth';
            }
            currentCache.push({
              car_source_no: r.car_source_no, car_name: r.car_name, small_path: r.small_path, first_on_card: first_on_card,
              car_mileage: r.car_mileage, publish_from: r.publish_from, estimate_price: r.estimate_price, detail_url: detailUrl,
              car_on_sale: r.car_on_sale
            });
          }

          objPage.setData({ noCar: '', buyCarList: currentCache });
        } else {
          // 标识最后一页
          if (tick == 1) {
            objPage.setData({ carEnd: false });
            objPage.setData({ noCar: 1 });
            noCarList();
          } else {
            objPage.setData({ carEnd: true });
          }
        }
        objPage.setData({ buyCarList: currentCache });
      }
    });
}

//筛选条件明细数据
function filtrate() {
  var url = CFG.USERDCAR_APP_API_HOST + 'BuyCar/getSearchParam';
  common.httpRequest(
    url, {
      loading: false,
      data: {
        pageParam: 'buyCarPage'
      },
      success: function (res) {
        var brandData = res.data.brand;
        for (var i in brandData) {
          var r = brandData[i];
          for (var x in r.group) {
            var y = r.group[x];
            brandList[y.brand_name] = y.id;
          }
        }

        var statusCode = res.statusCode;   //请求数据返回状态码
        var filtrData = res.data;          //列表数据
        if (200 == statusCode) {
          objPage.setData({ filter: filtrData });
        }
      }
    }
  );
}

//热门搜索
function noCarList() {
  var url = CFG.USERDCAR_APP_API_HOST + 'BuyCar/getSearch';
  common.httpRequest(
    url, {
      loading: false,
      data: {
      },
      success: function (res) {
        var statusCode = res.statusCode;   //请求数据返回状态码
        var tagList = res.data;          //列表数据
        if (200 == statusCode && tagList.length > 0) {
          var brandListInfo = {};
          for (var i in tagList) {
            var r = tagList[i];
            var brand_name = r.keyword;
            if (brandList[brand_name]) {
              var brand_id = brandList[brand_name];
              brandListInfo[brand_id] = brand_name;
            }
          }
          objPage.setData({ tagList: brandListInfo });
        }
      }
    }
  );
}

Page({
  data: {
    filter: [],
    filter_order_key: '',
    filter_order_value: '',
    filter_bg_price: '',
    filter_bg_brand: '',
    filter_bg_filter: '',
    switch_show: '',
    switch_slide_sort: '',
    switch_slide_price: '',
    switch_slide_brand: '',
    sm_show: '',
    carEnd: false,
    carIndex: 0,
    buyCarList: [],
    noCar: '',
    ufilterStyle: '',
    tagList: []
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    objPage = this;
    var data = {list_key: {}, list_name: {}};
    //判断对象是否为空
    var hasProp = false;
    for (var prop in options) {
      hasProp = true;
      break;
    }
    if (!hasProp) {
      wx.setStorageSync('filter_param_list', {list_key: {}, list_name: {}})   //同步设置本地存储品牌筛选条件
    } else {
      data = wx.getStorageSync('filter_param_list');     //同站获取本地存储价格筛选条件
      this.setData({
        ufilterStyle: 'ufilter-result',
        filter_teg: data
      });
    }

    loadInfoList(data);
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 筛选条件
    filtrate();
  },
  onPullDownRefresh:function(){
    wx.stopPullDownRefresh()
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    wx.setStorageSync('filter_param_list', null)   //同步设置本地存储品牌筛选条件
    // 页面关闭
  },
  onWaterFall: function () {
    //滑动到最下面的触发事件
    var data = wx.getStorageSync('filter_param_list')
    loadInfoList(data);
  },
  onBack: function (e) {
    //筛选数据为空时的返回事件处理
    objPage.setData({
      filter_teg: null,
      buyCarList: [],
      carIndex: 0,
      ufilterStyle: '',
      filter_bg_sort: '',
      filter_bg_price: '',
      filter_bg_brand: '',
    });
    var data = {list_key: {}, list_name: {}};
    loadInfoList(data);
  },
  onClickChoose: function (e) {
    //头部排序、价格、品牌点击展开显示事件处理
    var fType = e.currentTarget.dataset.filterType;
    switch (fType) {
      case 'sort':
        this.setData({
          filter_bg_sort: 'background:ghostwhite',
          filter_bg_price: '',
          filter_bg_brand: '',
          filter_bg_filter: '',
          switch_show: 'display:block',
          switch_slide_sort: 'on',
          switch_slide_price: '',
          switch_slide_brand: '',
        });
        break;
      case 'price':
        this.setData({
          filter_bg_sort: '',
          filter_bg_price: 'background:ghostwhite',
          filter_bg_brand: '',
          filter_bg_filter: '',
          switch_show: 'display:block',
          switch_slide_sort: '',
          switch_slide_price: 'on',
          switch_slide_brand: '',
        });
        break;
      case 'brand':
        this.setData({
          filter_bg_sort: '',
          filter_bg_price: '',
          filter_bg_brand: 'background:ghostwhite',
          filter_bg_filter: '',
          switch_show: 'display:block',
          switch_slide_sort: '',
          switch_slide_price: '',
          switch_slide_brand: 'on',
        });
        break;
      case 'filter':
        this.setData({
          filter_bg_sort: '',
          filter_bg_price: '',
          filter_bg_brand: '',
          filter_bg_filter: 'background:ghostwhite',
          switch_show_sort: '',
          switch_show_price: '',
          switch_show_brand: '',
          switch_slide_sort: '',
          switch_slide_price: '',
          switch_slide_brand: '',
        });
        break;
    }
  },
  onBuyOrder: function (e) {
    //头部排序、价格、品牌展开后点击条件的事件处理
    var dataset = e.currentTarget.dataset;
    var fType = dataset.type;       //筛选类型
    var value = dataset.value;      //筛选值
    var name = dataset.text;        //筛选显示名称
    this.setData({ ufilterStyle: 'ufilter-result' });
    var filter_param = wx.getStorageSync('filter_param_list');     //同站获取本地存储价格筛选条件
    
    if (!filter_param) {
      filter_param = filter_param_list;
    }
    switch (fType) {
      case 'sort':
        this.setData({ ufilterStyle: '' });
        filterList.order_key = dataset.order_key;                   //额外筛选key
        filterList.order_value = dataset.order_value;               //额外筛选值
        break;
      case 'price':
        this.setData({ ufilterStyle: 'ufilter-result' });
        filter_param.list_key.price = value;
        filter_param.list_name.price_name = name;
        wx.setStorageSync('filter_param_list', filter_param)   //同步设置本地存储价格筛选条件
        break;
      case 'brand':
        this.setData({ ufilterStyle: 'ufilter-result' });
        filter_param.list_key.brand = value;
        filter_param.list_name.brand_name = name;
        wx.setStorageSync('filter_param_list', filter_param)   //同步设置本地存储品牌筛选条件
        break;
    }
    filter_param_list = wx.getStorageSync('filter_param_list');
    objPage.setData({
      filter_teg: filter_param_list,      //筛选条件显示
      buyCarList: [],                     //清除列表数据
      switch_show: '',                    //隐藏筛选条件
      carIndex: 0,
      carEnd: false
    });

    loadInfoList(filter_param);                 //根据筛选条件重新获取数据列表
  },
  onFilterOff: function (e) {
    wx.setStorageSync('filter_param_list', {list_key: {}, list_name: {}})   //同步设置本地存储品牌筛选条件
    //删除顶部筛选标签
    objPage.setData({
      filter_teg: {list_key: {}, list_name: {}},
      buyCarList: [],
      carIndex: 0,
      ufilterStyle: '',
      filter_bg_sort: '',
      filter_bg_price: '',
      filter_bg_brand: '',
    });
    var data = {list_key: {}, list_name: {}};
    objPage.setData({
      buyCarList: [],                     //清除列表数据
      carIndex: 0,
      carEnd: false
    });
    loadInfoList(data);                 //清空筛选条件获取数据列表
  },
  onClickHide: function () {
    //遮罩层的点击事件处理
    this.setData({
      filter_bg_sort: '',
      filter_bg_price: '',
      filter_bg_brand: '',
      filter_bg_filter: '',
      switch_show: '',
      switch_slide_sort: '',
      switch_slide_price: '',
      switch_slide_brand: '',
    });
  }
})