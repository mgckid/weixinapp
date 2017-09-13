var CFG = require('../../../utils/config.js');
var common = require('../../../utils/util.js')
var objPage = '';

//显示登录弹出信息
function alertLogin() {
  wx.showModal({
    title: '提示',
    content: '登录已过期，请从新登录',
    confirmText:'登录',
    success: function (res) {
        wx.navigateTo({url: '/pages/user/login/index'})
    }
  });
}

//检测是否登录
function checkLogin() {
  wx.getStorage({
    key: 'token', success: function (e) {
    objPage.setData({token:e.data});
      ajaxGetMoneyDetail();
    }, fail: function (res) {
      alertLogin();
    }
  });
}


//ajax获取我的车辆列表
function ajaxGetMoneyDetail(){
  var that = objPage;
  var url = CFG.APP_API_HOST + 'Account/V2/Bill/billDetail';
  common.httpRequest(url, {
    data: {token:that.data.token,billID:that.data.billID,currencyType:100},
    success: function (res) {
      var data = res.data;
      if (undefined !== data) {
        that.setData({ detailData: data });
      }
    },
    fail: function () {
      wx.showToast({
            title: '服务器连接失败!',
            duration: 2000
      })
    }
  })
}


Page({
  data:{
    token: '',
    billID: '',
    detailData:'',
    },
  onLoad:function(options){
    objPage = this;
    this.setData({billID:options.billID});
  },
  onShow:function(){
    checkLogin();
  },
  onPullDownRefresh: function (e) {
    wx.stopPullDownRefresh();
  }
})