var common = require('../../../../utils/util.js')
var CFG = require('../../../../utils/config.js')
var objPage = null;

Page({
  data: {
    personList: null,
    token: ''
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    objPage = this;
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
    checkLogin(this);
  },
  onPullDownRefresh:function(){
    wx.stopPullDownRefresh()
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  }
})

//显示登录弹出信息
function alertLogin() {
  wx.showModal({
    title: '提示',
    content: '登录已过期，请重新登录',
    confirmText: '登录',
    success: function (res) {
      wx.navigateTo({ url: '/pages/user/login/index' })
    }
  });
}

//检测是否登录
function checkLogin(that) {
  wx.getStorage({
    key: 'token', success: function (e) {
      that.setData({ token: e.data });
      personList(that);
    }, fail: function (res) {
      alertLogin();
    }
  });
}

//自由发布列表
function personList(that) {
  var mobile = wx.getStorageSync('login_name');
  var timestamp = Date.parse(new Date()) / 1000;
  var url = CFG.USERDCAR_APP_API_HOST + 'SellCar/carList';
  common.httpRequest(
    url, {
      pageLoading: true,
      data: {
        token: that.data.token,
        timestamp: timestamp,
        mobile: mobile
      },
      success: function (res) {
        var statusCode = res.statusCode;
        var data = res.data;
        if (200 == statusCode && undefined !== data) {
          objPage.setData({
            personList: data
          });
        }
      }
    })
}

//获取用户登陆信息
function login_info(token) {
  var url = CFG.APP_API_HOST + 'Account/V2/Users';
  common.httpRequest(url, {
    data: { token: token },
    success: function (res) {
      var statusCode = res.statusCode;
      var login_info = res.data;
      if (statusCode == 200) {
        login_info.avatar = login_info.avatar ? login_info.avatar : CFG.DEFAULT_AVATAR;
        objPage.setData({ loginInfo: login_info });
      } else {
        alertLogin();
      }
    }
  })
}

function alertLogin() {
  wx.showModal({
    title: '提示',
    content: '会话已过期，请重新登录',
    confirmText: '登录',
    success: function (res) {
      if (res.confirm) {
        wx.navigateTo({ url: '/pages/user/login/index' })
      }
    }
  });
}