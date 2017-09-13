// pages/user/order/index.js
var CFG = require('../../../utils/config.js');
var common = require('../../../utils/util.js');
var objPage = null;

//显示登录弹出信息
function alertLogin() {
  wx.showModal({
    title: '提示',
    content: '登录已过期，请从新登录',
    confirmText: '登录',
    success: function (res) {
      if (res.confirm) {
        wx.navigateTo({ url: '/pages/user/login/index' })
      }
    }
  });
}

//检测是否登录
function checkLogin() {
  wx.getStorage({
    key: 'token', success: function (e) {
      objPage.setData({ token: e.data }); 
      loadOrderList();
    }, fail: function (res) {
      alertLogin();
    }
  });
}

Page({
  data: {
    listIndex: 0,
    count: 10,
    list: [],
    orderType: '',
    token: '',
    ORDER_TYPE: {
      '40': '4s店促销预约订单',
      '30': '违章代缴',
      '31': '车辆年检',
      '32': '驾驶证换证',
      '60': '4s店保养订单',
      '70': '维修预约',
      '41': '特价车订单',
      '42': '快修洗车订单',
      '75': '维修订单',
      '76': '装潢保养订单',
      '80': '余额充值',
      '81': '保证金充值',
    },

  },
  onLoad: function (options) {
    objPage = this;
    // loadOrderList(this);
  },
  onShow: function () {
    checkLogin();
    // 页面显示
  },
  onWaterFall: function () {
    loadOrderList('');
  },
  onClickWait:function(){
     common.msg('敬请期待 :)');
  },
  onPullDownRefresh: function (e) {
    wx.stopPullDownRefresh();
  }
})

function loadOrderList() {
  var tick = objPage.data.listIndex + 1;
  objPage.setData({ listIndex: tick });
  var token = objPage.data.token;
  var orderType = objPage.data.orderType;
  var count = objPage.data.count;
  var url = CFG.APP_API_HOST + 'Account/V2/Order/OrderList';
  common.httpRequest(url, {
    pageLoading:true,
    data: {
      token: token,
      page: tick,
      count: count,
      orderType: orderType,
    },
    success: function (res) {
      var statusCode = res.statusCode;
      var list = res.data;
      var currentCache = [];
      currentCache = objPage.data.list;
      if (tick == 1) {
        currentCache = [];
        objPage.setData({ list: currentCache });
      }
      if (200 == statusCode && list.length) {
        for (var i in list) {
          var r = list[i];
          r.orderType = r.orderID.substring(0, 2);
          currentCache.push(r);
        }
        objPage.setData({ list: currentCache });
      } else {
        objPage.setData({ newsEnd: true });
      }
    }
  });
}
