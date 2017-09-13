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
      wx.navigateTo({url: '/pages/user/login/index'})
    }
  });
}

//检测是否登录
function checkLogin(that) {
  wx.getStorage({
    key: 'token', success: function (e) {
      that.setData({ token: e.data });
      ajaxGetMoneyList(that);
    }, fail: function (res) {
      alertLogin();
    }
  });
}

//ajax获取消费记录列表
function ajaxGetMoneyList(that) {
  var tick = that.data.listIndex;
  var lm = that.data.listMonth;
  var url = CFG.APP_API_HOST + 'Account/V2/Bill/balanceBill';
  var mlArray = { token: that.data.token, count: that.data.listCount, page: tick };
  if (lm) {
    mlArray.lm = lm;
  }
  common.httpRequest(url, {
    pageLoading:true,
    data: mlArray,
    success: function (res) {
      if (res.statusCode === 200) {
        var billListData = setBillData(res.data.billList);
        if (tick == 1) {
          that.setData({ billInfo: { balance: common.priceFormat(res.data.balance, -1), prepaidAmount: common.priceFormat(res.data.prepaidAmount, -1), expendamount: common.priceFormat(res.data.expendamount, -1) }, billList: billListData });
        } else {
          that.setData({ billList: billListData });
        }
        tick+=1;
        that.setData({ listIndex: tick, listMonth: res.data.end_month });
      } else {
        that.setData({ listEnd: true });
      }
    }
  })
}


//格式化处理消费记录信息
function setBillData(data) {
  var currentCache = objPage.data.billList;
  var w = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  if (data)
    data.map(function (e) {
      e.prepaidMonth = common.priceFormat(e.prepaidMonth);
      e.expendMonth = common.priceFormat(e.expendMonth);
      e.matter.map(function (v) {
        var str = v.payTime.replace(/-/g, "/"); //将字符串转换为时间格式，不然不兼容小程序
        var date = new Date(str);
        var m = (date.getMonth() + 1);
        var d = (date.getDate());
        v.payDate = (m > 9 ? m : '0' + m) + '-' + (d > 9 ? d : '0' + d);
        // v.payDate = common.formatDate(v.payTime, 'MM.dd'); //转换方法二
        v.payWeek = w[date.getDay()];
        v.typeImgPath = getTypeImgPath(v.transactionType);
        v.money = ((v.transactionType == '20' || v.transactionType == '50') ? '-' : '+') + common.priceFormat(v.number);
      });
      currentCache.push({ month: e.month, subtotal: e.subtotal, expendMonth: e.expendMonth, prepaidMonth: e.prepaidMonth, matter: e.matter });
    });
  return currentCache;
}


//返回交易类型图片
//10:充值 20:消费 30:退款 40:纯充值  50:余额消费  60:退余额
function getTypeImgPath(types) {
  var path = 'http://app-interface.hxqc.com/wukocar/account/img/';
  var imgSrc = '';
  if (types == '20' || types == '50') {
    imgSrc = 'xiaofei.png';
  } else if (types == '30' || types == '60') {
    imgSrc = 'tuikuan.png';
  } else if (types == '10' || types == '40') {
    imgSrc = 'chongzhi.png';
  }
  return path + imgSrc;
}


Page({
  data: {
    token: '',
    billInfo: { balance: 0, prepaidAmount: 0, expendamount: 0 },
    billList: [],
    listIndex: 1,
    listCount: '15',
    listMonth: '',
    listEnd: false,
  },
  onLoad: function (options) {
    objPage = this;
  },
  onShow: function () {
    checkLogin(this);
  },
  onWaterFall: function () {
    ajaxGetMoneyList(this);
  },
  onPullDownRefresh: function (e) {
    wx.stopPullDownRefresh();
  }
})