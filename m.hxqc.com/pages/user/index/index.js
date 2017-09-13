var CFG = require('../../../utils/config.js');
var common = require('../../../utils/util.js');
var objPage = null;
var userNavList = [
  { img: 'http://m.hxqc.com/wxapp/index/vip_orders/home-main01.png', url: '/pages/user/order/index', text: '我的订单' },
  { img: 'http://m.hxqc.com/wxapp/index/vip_orders/home-main07.png', url: '/pages/user/myVehicler/index', text: '车辆信息' },
  { img: 'http://m.hxqc.com/wxapp/index/vip_orders/home-main08.png', url: '/pages/user/memberbook/index', text: '会员手册' },
  // { img: 'http://m.hxqc.com/wxapp/index/vip_orders/home-main12_gray.png', url: '', text: '在线客服' },
  { img: 'http://m.hxqc.com/wxapp/index/vip_orders/home-main02.png', url: '/pages/user/wallet/index', text: '我的钱包' },
  { img: 'http://m.hxqc.com/wxapp/index/vip_orders/home-main17.png', url: '/pages/usedcar/sale/index/personage', text: '我的二手车' },
  // { img: 'http://m.hxqc.com/wxapp/index/vip_orders/home-main19_gray.png', url: '/User/Order/index.html', text: '客户投诉' },
  // { img: 'http://m.hxqc.com/wxapp/index/vip_orders/home-main11_gray.png', url: '../comment/orderComment', text: '我的评价' },
  // { img: 'http://m.hxqc.com/wxapp/index/vip_orders/home-main03_gray.png', url: '/User/Order/index.html', text: '购物车' }
]

// 移除登录信息
function clearToken() {
  try {
    wx.removeStorageSync('token');
    var userInfo = objPage.data.user;
    userInfo.avatar =CFG.DEFAULT_AVATAR;
    objPage.setData({ isLogin: false, user: userInfo });
    wx.removeStorageSync('login_name');
  } catch (e) {
  }
}

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

function checkLogin(that) {
  that = objPage;
  wx.getStorage({
    key: 'token', success: function (e) {
      var req = {};
      req.token = e.data;
      ajaxGetUserInfo(req, that);
    }, fail: function (res) {
      that.setData({ isLogin: false });
    }
  });
}

function ajaxGetUserInfo(data, page) {
  // 提交验证
  
  var url = CFG.APP_API_HOST + 'Account/V2/Users';
  common.httpRequest(url, {
    data: data,
    success: function (res) {
      var tel = res.data.phoneNumber;
      var avatar = res.data.avatar;
      var nickName = res.data.nickName;
      var code = res.data.code;
      var msg = res.data.message;

      if (undefined !== tel && tel) {
        var info = {};
        info.tel = tel;
        info.nickName = nickName;
        info.avatar = avatar?avatar:CFG.DEFAULT_AVATAR;

        page.setData({ user: info, isLogin: true });

      } else if (undefined !== code && code >= 200) {
        clearToken()
      } else {
        clearToken()
        common.msg('未知错误');
      }
    }
  })
}

Page({
  data: {
    isLogin: false,
    ready: 0,
    user: {
      tel: '',
      nickName: '',
      avatar: CFG.DEFAULT_AVATAR
    },
    toView: 'red',
    scrollTop: 100,
    userNavList: userNavList,
    imgData: 'http://s.t.hxqc.com/newcar/frontend_upload/user/1c/fb/1cfb5513b17aedc2fc4ab8c0ae9a7582_100_100.jpg',
    resPathList: ''
  },
  onLoad: function () {
    objPage = this;
  },
  onShow: function (e) {
    checkLogin(this);
  },
  logout:function(e){
    clearToken();
  },
  onPullDownRefresh: function (e) {
    wx.stopPullDownRefresh();
  }
})