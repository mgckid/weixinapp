var CFG = require('../../../utils/config.js');
var common = require('../../../utils/util.js');
var objPage = '';

//显示登录弹出信息
function alertLogin() {
  wx.showModal({
    title: '提示',
    content: '登录已过期，请从新登录',
    confirmText: '登录',
    success: function (res) {
      //if (res.confirm) {
        wx.navigateTo({ url: '/pages/user/login/index' })
     // }
    }
  });
}

//检测是否登录
function checkLogin() {
  that = objPage;
  wx.getStorage({
    key: 'token', success: function (e) {
      that.setData({ token: e.data });
      ajaxGetWallet(that);
    }, fail: function (res) {
      alertLogin();
    }
  });
}

function ajaxGetWallet() {
  that = objPage;
  var url = CFG.APP_API_HOST + 'Account/V2/Wallet/index';
  common.httpRequest(url, {
    data: { token: that.data.token},
    method: 'GET',
    success: function (res) {
      if (res.statusCode === 200) {
        that.setData({ balance: res.data.balance});
      } else {
        common.msg('取我的钱包信息失败!');
      }
    },
    fail: function (res) {
      common.msg('服务器连接失败!');
    }
  })
}

Page({
  data: {
    token: '',
    balance: 0,
  },
  onLoad: function (options) {
    objPage = this;
  },
  onShow: function () {
    // 页面显示
    checkLogin();
  },
  onPullDownRefresh: function (e) {
    wx.stopPullDownRefresh();
  },
  onClickWait: function () {
    common.msg('敬请期待 :)');
  },
})