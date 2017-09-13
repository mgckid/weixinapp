// pages/shop/news/order.js
var common = require('../../../utils/util.js')
var CFG = require('../../../utils/config.js')
var objPage = null;
Page({
  data: {
    title: '',
    shopName: '',
    user: '',
    tel: '',
    shopID: '',
    promotionID: '',
   	consultTel: '',
   	price:0.00
  },
  onLoad: function (opt) {
    console.log(opt);
    objPage = this;
    var sets = {};
    sets.title = opt.title;
    sets.shopName = opt.shopName;
    sets.consultTel = opt.tel;
    sets.shopID = opt.shopID;
    sets.promotionID = opt.promotionID;
    sets.price = opt.price;
    objPage.setData(sets);

    // 初始化用户信息
    common.checkToken({
      success: function (e) {
        const statusCode = e.statusCode
        const data = e.data
        if (200 === statusCode && !!data.phoneNumber) {
          sets.user = data.fullname;
          sets.tel = data.phoneNumber;
          objPage.setData(sets);
        }
      }
    })
  },
  onSubmit: function (e) {
    onSubmit(e)
  },
  onCall: function (e) {
    common.onCall(e);
  }
})

function onSubmit(e) {
  var form = e.detail.value;
  if (false === (common.validReg('realname', form.name) && common.validReg('mobile', form.mobile))) {
    return;
  }
  if (0 == form.chk_agree.length) {
    common.msg('请勾选个人信息保护声明');
    return false;
  }

  // 提交订单
  const post = {};
  post.fullname = form.name;
  post.mobile = form.mobile;
  post.promotionID = objPage.data.promotionID;
  post.shopID = objPage.data.shopID;
  post.siteID = CFG.SITE_ID;
  post.siteName = CFG.SITE_NAME;
  post.token = wx.getStorageSync('token');

  console.log(post);
  doOrder(post)
}

function doOrder(data) {
  const u = CFG.APP_API_HOST + '/Shop/V2/Order';
  common.httpRequest(u, {
    data: data,
    method: 'POST',
    success: function (res) {
      var statusCode = res.statusCode;
      var data = res.data;
      if (200 == statusCode && !!data.orderID) {
      	  const orderID = data.orderID
          wx.navigateTo({url:'/pages/shop/news/pay?orderID='+orderID+'&price=' + objPage.data.price})
      } else {
        common.msg('订单创建失败，请重试!');
      }
    }
  });
}