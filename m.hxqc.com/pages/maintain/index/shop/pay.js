// pages/maintain/index/shop/pay.js
var common = require('../../../../utils/util.js')
var CFG = require('../../../../utils/config.js')
var mapTool = require('../../../../utils/GPS.js');
var objPage = null;

// 初始化账户余额
function initBanlance() {
  var token = wx.getStorageSync('token');

  var u = CFG.APP_API_HOST + 'Account/V2/wallet';
  common.httpRequest(u, {
    data: { token: token },
    pageLoading: true,
    success: function (res) {
      var statusCode = res.statusCode;
      var info = res.data;
      if (200 == statusCode && undefined !== info.balance) {
        // 价格格式化:
        info.balance = parseFloat(info.balance).toFixed(2);
        objPage.setData({ wallet: info });
      } else {
        common.msg('账户余额获取失败');
      }
    },
  })
}

function doPay() {
  var pData = objPage.data;
  var token = wx.getStorageSync('token');

  var payMethod = pData.payMethod;
  var orderID = pData.orderID;
  var u = CFG.MAINTAIN_APP_API_HOST + 'Payment/pay';
  var balance = parseFloat(pData.wallet.balance);
  var pay = parseFloat(pData.pay);

  var post = { token: token, orderID: orderID, paymentID: payMethod };
  if ('BALANCE' == payMethod) {
    if (balance < pay) {
      common.msg('余额不足，请选择其它支付方式');
      return;
    }
    post.password = pData.pwd;
    u = CFG.MAINTAIN_APP_API_HOST + 'Pay/blance';
  }

  if('WEIXIN' === post.paymentID){
    var openId = wx.getStorageSync('openid');
    if(!openId){
      common.msg('openId不能为空');
      return;
    }
    post.paymentID = 'WEIXINXCX';
    post.openId = openId;// 'oahAJ0etPchBhPnojFmzJ6BlVKUE'
  }

  common.httpRequest(u, {
    data: post,
    method: 'POST',
    success: function (res) {
      var statusCode = res.statusCode;
      var info = res.data;
      if (200 == statusCode) {
        switch (payMethod) {
          case 'WEIXIN':
            if(!!info.url){
              var payInfo = JSON.parse(info.url);
              if( 'object' === typeof payInfo && !!payInfo.appId){
                  wx.requestPayment({
                     'timeStamp': payInfo.timeStamp,
                     'nonceStr': payInfo.nonceStr,
                     'package': payInfo.package,
                     'signType': payInfo.signType,
                     'paySign': payInfo.paySign,
                     'success':function(res){
                        objPage.setData({
                          payTitle: '支付成功'
                        });
                        getOrderDetial(orderID);
                     },
                     'fail':function(res){
                      if('requestPayment:fail cancel' == res.errMsg){
                        common.msg('您取消了支付');
                      }else{
                        common.msg('支付失败:'+res.errMsg);
                      }
                     }
                  })
                  return ;
              }
            }
            common.msg('支付失败(10012)');
            break;
          case 'BALANCE':
            if (!!info.orderID) {
              objPage.setData({
                payTitle: '支付成功'
              });
              getOrderDetial(orderID);
            } else {
              common.msg('支付失败(未知原因).')
            }
            break;
          case 'INSHOP':
            if(!!info.orderID){
              getOrderDetial(orderID);
            }else{
              common.msg('操作失败(未知原因)');
            }
            break;
        }

      } else if (undefined !== info.code && 400 == info.code) {
        common.msg(info.message);
      } else {
        common.msg('支付失败(未知原因)');
      }
    },
  })
}

function onChangePwd(e) {
  var v = e.detail.value;
  v = common.trim(v);
  objPage.setData({ pwd: v });
  if (6 === v.length) {
    hidePassPanel();
    doPay();
  }
}

function showPassPanel() {
  objPage.setData({ pwd: '', pwdOn: 'on' });
}
function hidePassPanel() {
  objPage.setData({ pwdOn: '' });
}

function showPaySuccess(e) {
  objPage.setData({ paySucess: 'on' });
}

function getOrderDetial(orderID) {
  var token = wx.getStorageSync('token');
  var u = CFG.MAINTAIN_APP_API_HOST + 'Order/detail';
  common.httpRequest(u, {
    data: { token: token, orderID: orderID },
    pageLoading: true,
    success: function (res) {
      var statusCode = res.statusCode;
      var info = res.data;
      if (200 == statusCode && undefined !== info.amount) {
        objPage.setData({ payInfo: info });
        showPaySuccess();
      } else {
        common.msg('获取订单信息失败');
      }
    },
  })

}
Page({
  data: {
    wallet: {},
    orderID: '',
    pay: '',
    pwd: '',
    payMethod: 'WEIXIN',
    payTypes: { WEIXIN: 1, BALANCE: 0, INSHOP: 0 },
    paySucess: '',
    pwdOn: '',
    pwdFocus: false,
    payInfo: {},
    payTitle:'提交成功'
  },
  onLoad: function (opt) {
    objPage = this;
    var sets = {};
    sets.orderID = opt.orderID;
    sets.pay = opt.pay;
    this.setData(sets);

    // 初始化账单余额
    initBanlance();
  },
  payChooise: function (e) {
    var payTypes = this.data.payTypes
    var type = e.currentTarget.dataset.id;
    for (var i in payTypes) {
      if (i == type) {
        payTypes[i] = 1;
      } else {
        payTypes[i] = 0;
      }
    }

    objPage.setData({ payTypes: payTypes, payMethod: type });
  },
  onClickPay: function (e) {
    var pData = objPage.data;
    var payMethod = pData.payMethod
    var balance = parseFloat(pData.wallet.balance);
    var pay = parseFloat(pData.pay);
    switch (payMethod) {
      case 'WEIXIN':
        doPay();
        break;
      case 'BALANCE':
        if (balance < pay) {
          common.msg('余额不足，请选择其它支付方式');
          return;
        }
        showPassPanel()
        break;
      case 'INSHOP':
        doPay();
        break
      default:
        common.msg('未知支付方式');
    }
  },
  onChangePwd: function (e) {
    onChangePwd(e)
  },
  paySucess: function () {
    common.goTo('ORDER_LIST');
  },
  showPassPanel: function () {
    showPassPanel()
  },
  hidePassPanel: function () {
    hidePassPanel()
  },
  onPullDownRefresh: function (e) {
    wx.stopPullDownRefresh();
  }
})