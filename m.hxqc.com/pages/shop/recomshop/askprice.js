// pages/shop/recomshop/askprice.js
var common = require('../../../utils/util.js')
var CFG = require('../../../utils/config.js')
var citySlider = require('../../../utils/citySlider/index.js');
var objPage = null;

// 添加询问底价
function addAskPrice(data) {
  var url = CFG.APP_API_HOST + '/Shop/V2/Message';
  common.httpRequest(url, {
    data: common.http_build_query(data),
    method: 'POST',
    success: function (res) {
      var statusCode = res.statusCode;
      var apiReturn = res.data;
      if (200 == statusCode && undefined !== apiReturn.code && 200 == apiReturn.code) {
        var textType = 1 == objPage.data.askPrice ? '询价' : '试驾';
        common.msg('您的' + textType + '信息已提交，我们将及时联系您进行报价');
      } else {
        common.msg('提交失败，请重试!');
      }
    }
  });
}

Page({
  data: { itemName: '', itemID: "", shopID: '', askPrice: 0 },
  onLoad: function (form) {
    objPage = this;
    // 侧滑地区
    citySlider.init(this);
    var sets = {};
    sets.itemName = form.itemName;
    sets.itemID = form.itemID;
    sets.shopID = form.shopID;
    sets.askPrice = form.askPrice;
    this.setData(sets);

    // 设置标题
    if (1 == form.askPrice) {
      wx.setNavigationBarTitle({ title: '询问底价' })
    } else {
      wx.setNavigationBarTitle({ title: '试乘试驾' })
    }
  },
  onSubmit: function (opt) {
    var currentCity = this.getCurrentCity();
    var form = opt.detail.value;
    var isExchange = (undefined !== form.chk_exchange && form.chk_exchange.length > 0) ? 1 : 0;

    var data = {};
    data.city = currentCity.cityName;
    data.cityID = currentCity.cityID;
    data.exchange = isExchange;
    data.fullname = form.name;
    data.gender = form.radio_gender;
    data.messageType = 1 == this.data.askPrice ? 10 : 20;
    data.mobile = form.mobile;
    data.province = currentCity.provinceName;
    data.shopID = this.data.shopID;
    data.itemID = this.data.itemID;
    // 判断是否勾选我同意
    if (0 == form.chk_agree.length) {
      common.msg('请勾选个人信息保护声明');
      return false;
    }

    var fullname = common.validReg('realname', data.fullname);
    if (!fullname) {
      //聚焦
      var sets = {};
      sets.focusName = true;
      sets.focusMobile = false;
      this.setData(sets);
      return false;
    }
    var mobile = common.validReg('mobile', data.mobile);
    if (!mobile) {
      var sets = {};
      sets.focusName = false;
      sets.focusMobile = true;
      this.setData(sets);
      return false;
    }
    if ('' === data.itemID) {
      common.msg('请至少选择一家经销商为您服务');
      return;
    }
    addAskPrice(data);
  },
  onPullDownRefresh: function (e) {
    wx.stopPullDownRefresh();
  }
})