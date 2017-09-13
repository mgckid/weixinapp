// pages/maintain/index/shop/shop-order.js

var common = require('../../../../utils/util.js')
var CFG = require('../../../../utils/config.js')
var mapTool = require('../../../../utils/GPS.js');
var objPage = null;
var cityList = [
  { abbr: '京', statusClass: '' }, { abbr: '沪', statusClass: '' }, { abbr: '津', statusClass: '' }, { abbr: '渝', statusClass: '' }, { abbr: '浙', statusClass: '' }, { abbr: '苏', statusClass: '' }, { abbr: '粤', statusClass: '' }, { abbr: '鄂', statusClass: '' },
  { abbr: '晋', statusClass: '' }, { abbr: '冀', statusClass: '' }, { abbr: '豫', statusClass: '' }, { abbr: '川', statusClass: '' }, { abbr: '辽', statusClass: '' }, { abbr: '吉', statusClass: '' }, { abbr: '黑', statusClass: '' }, { abbr: '皖', statusClass: '' },
  { abbr: '鲁', statusClass: '' }, { abbr: '湘', statusClass: '' }, { abbr: '赣', statusClass: '' }, { abbr: '闽', statusClass: '' }, { abbr: '陕', statusClass: '' }, { abbr: '甘', statusClass: '' }, { abbr: '宁', statusClass: '' }, { abbr: '蒙', statusClass: '' },
  { abbr: '贵', statusClass: '' }, { abbr: '云', statusClass: '' }, { abbr: '桂', statusClass: '' }, { abbr: '琼', statusClass: '' }, { abbr: '新', statusClass: '' }, { abbr: '藏', statusClass: '' }, { abbr: '港', statusClass: '' }, { abbr: '澳', statusClass: '' }
];

function init() {
  common.checkToken({
    success: function (e) {
      // 初始化日期时间控件
      initDateTime();

      // 初始化用户信息
      var sets = {};
      sets.user = e.data;
      objPage.setData(sets);

      // 初始化店铺信息
      var shopID = objPage.data.shopID;
      initShopInfo(shopID);
    }
  })
}

//初始化店铺信息
function initShopInfo(shopID) {
  var url = CFG.APP_API_HOST + 'Shop/V2/Shop';
  common.httpRequest(url, {
    data: { shopID: shopID },
    success: function (res) {
      var statusCode = res.statusCode;
      var info = res.data;
      if (200 == statusCode && undefined !== info.shopInfo) {
        objPage.setData({ shopInfo: info.shopInfo });

        // 获取保养项目
        getMaintians();
      } else {
        common.msg('店铺数据获取失败');
      }
    },
  })
}

// 获取保养项目列表
function getMaintians() {

  var pData = objPage.data;
  var data = { token: pData.token, shopType: pData.shopInfo.shopType, shopID: pData.shopID, seriesID: pData.serieID, items: pData.itemsJSON, brandID: pData.brandID, autoModelID: pData.modelID }
  data.score = -1;
  data.plateNumber = pData.plateNumber;
  data.myAutoID = '';
  data.couponID = -1;

  var u = CFG.MAINTAIN_APP_API_HOST + 'Maintenance/prepareN2';
  common.httpRequest(u, {
    data: data,
    pageLoading: true,
    success: function (res) {
      var statusCode = res.statusCode;
      var info = res.data;
      var summary = { pay: 0.00, total: 0.00, goods: 0.00, discount: 0.00, workCost: 0.00 };

      if (200 == statusCode && undefined !== info.items) {
        // 优惠券:
        var ls_coupon = !!info.coupon.length ? info.coupon : [];
        var coupon_index = -1;
        for (var i in ls_coupon) {
          // 价格格式化:
          ls_coupon[i].price = parseFloat(ls_coupon[i].price).toFixed(2);
          ls_coupon[i].priceInt = parseInt(ls_coupon[i].price);
          if (ls_coupon[i].isChoose > 0) {
            coupon_index = i;
          }
        }
        var ls = info.items;
        // 价格格式化+汇总
        {
          for (var i in ls) {
            for (var j in ls[i].items) {
              var workCost = ls[i].items[j].workCost;
              var discount = ls[i].items[j].discount;
              summary.workCost += parseFloat(workCost);
              summary.discount += parseFloat(discount);
              // 工时
              ls[i].items[j].workCost = parseFloat(workCost).toFixed(2);

              // 材料
              for (var k in ls[i].items[j].goods) {
                for (var h in ls[i].items[j].goods[k]) {
                  var p_goods = parseFloat(ls[i].items[j].goods[k][h].amount);
                  if (ls[i].items[j].goods[k][h].choose > 0) {
                    summary.goods += p_goods;
                  }
                  ls[i].items[j].goods[k][h].amount = p_goods.toFixed(2);
                }
              }
            }
          }
        }

        // 价格汇总:
        summary.total = summary.workCost + summary.goods;
        summary.pay = summary.total - summary.discount;

        var coupon_fmt = pData.coupon_fmt;
        // 计算优惠券优惠金额
        if (-1 != coupon_index) {
          var coupon_v = parseFloat(ls_coupon[coupon_index].price);
          summary.pay = summary.pay - coupon_v;
        }

        // 价格格式化:
        summary.total = summary.total.toFixed(2);
        summary.discount = summary.discount.toFixed(2);
        summary.workCost = summary.workCost.toFixed(2);
        summary.pay = summary.pay.toFixed(2);
        summary.goods = summary.goods.toFixed(2);

        objPage.setData({ goods: ls, summary: summary, coupons: ls_coupon, coupon_index: coupon_index });
      } else {
        common.msg('订单详情信息获取失败');
      }
    },
  })
}

function onClickCoupon(e) {
  var coupons = objPage.data.coupons;
  var opt = e.currentTarget.dataset;
  var i = opt.index;
  if (i == objPage.data.coupon_index) {
    return;
  } else {
    for (var j in coupons) {
      if (j == i) {
        coupons[j].isChoose = 1;
      } else {
        coupons[j].isChoose = 0;
      }
    }
    objPage.setData({ coupons: coupons, coupon_index: i });
  }
}

function flushCoupon() {
  var pData = objPage.data;
  var summary = pData.summary;
  var ls_coupon = pData.coupons;
  var coupon_index = pData.coupon_index;

  summary.pay = parseFloat(summary.total) - parseFloat(summary.discount);
  // 计算优惠券优惠金额
  if (-1 != coupon_index) {

    var coupon_v = parseFloat(ls_coupon[coupon_index].price);
    summary.pay = summary.pay - coupon_v;
  }

  // 价格格式化:
  summary.pay = summary.pay.toFixed(2);
  objPage.setData({ summary: summary })
}

// 不使用优惠券
function onClearCoupon() {
  var coupons = objPage.data.coupons;
  for (var j in coupons) {
    coupons[j].isChoose = 0;
  }
  objPage.setData({ coupons: coupons, coupon_index: -1 });
}

// 初始化日期和时间
function initDateTime() {
  var dateObj = new Date();
  var dateObj_7 = new Date();
  dateObj_7.setDate(dateObj_7.getDate() + 7); // 7天后
  var date = common.formatDate(dateObj.toDateString(), 'yyyy-MM-dd');
  var date_7 = common.formatDate(dateObj_7.toDateString(), 'yyyy-MM-dd');
  var sets = {};
  sets.date = date;
  sets.today = date;
  sets.date_7 = date_7;
  objPage.setData(sets);
}

//导航事件
function onNav(e) {
  var lat = e.currentTarget.dataset.lat;
  var lng = e.currentTarget.dataset.lng;
  var loc = mapTool.GPS.bd_decrypt(lat, lng);
  lat = loc.lat;
  lng = loc.lon;

  wx.openLocation({
    latitude: lat,
    longitude: lng,
    scale: 14
  })
}

function onChangeCarNum(e) {
  var pData = objPage.data;
  var c = pData.current_city;
  var v = e.detail.value;
  var sets = {};
  sets.carNum = v;
  var carNum = c + v;
  carNum = common.trim(carNum);
  carNum = carNum.toUpperCase();
  sets.plateNumber = carNum;
  // 验证车牌号:
  var chk = common.validReg('licensenumber', carNum);
  if (!chk) {
    return false;
  }

  var plateNumber = carNum;
  objPage.setData(sets)

  // 刷新保养项目，检测优惠券
  getMaintians();
}

function hideCouponLayer() {
  objPage.setData({ coupon_show: 'city_show' });
}

// 创建订单
function submit(e){
  var pData = objPage.data;
  var opt = e.detail.value;
  var name = common.trim(opt.name);
  var mobile = common.trim(opt.mobile);
  var carNum = pData.plateNumber;
  var pay = pData.summary.pay;

  // 校验：姓名，手机号，车牌号
  {
    //车牌号验证
    var chk_licence = common.validReg('licensenumber', carNum);
    if (!chk_licence) {
      return false;
    }

    //联系人验证
    var chk_name = common.validReg('username', name);
    if (!chk_name) {
      return false;
    }

    //手机号验证
    var chk_phone = common.validReg('mobile', mobile);
    if (!chk_phone) {
      return false;
    }
  }

  var token = wx.getStorageSync('token');
  var distance = parseInt(wx.getStorageSync('maintain_defalut_model_driving_distance'));

  var data = { token: pData.token, shopType: pData.shopInfo.shopType, shopID: pData.shopID, seriesID: pData.serieID, choose: pData.itemsJSON, brandID: pData.brandID, autoModelID: pData.modelID }
  
  data.apppintmentDate = pData.date + ' ' + pData.time
  data.drivingDistance = distance;
  data.score = 0;
  data.plateNumber = carNum;
  data.myAutoID = '';
  data.couponID = (-1 != pData.coupon_index) ? pData.coupons[pData.coupon_index].couponID:-1;
  data.name = name;
  data.phone = mobile;

  var u = CFG.MAINTAIN_APP_API_HOST + 'Maintenance/orderCreatedN2';
  // 检验是否登录:
  common.checkToken({
    success: function (e) {
    common.httpRequest(u, {
    data: data,
    success: function (res) {
      var statusCode = res.statusCode;
      var info = res.data;
      if (200 == statusCode && undefined !== info.orderID) {
        // 跳转支付页面:
        var u_pay = "/pages/maintain/index/shop/pay?orderID="+info.orderID + "&pay=" + pay ;
        wx.redirectTo({url:u_pay});
        return
         // common.msg('订单提交成功,订单号：'+info.orderID);
      } else if(!!info.code && 400 == info.code){
        common.msg(info.message);
      }else{
        common.msg('订单创建失败!请联系客服');
      }
    },
  })
    }
  });
}

Page({
  data: {
    city_show: '',
    user: {},
    shopInfo: {},
    token: '',
    shopID: '',
    brandID: '',
    serieID: '',
    modelID: '',
    itemsJSON: '',
    goods: [],
    choose_show:'on',
    today: '',
    date: '',
    date_7: '',
    time: '08:30',
    current_city: '鄂',
    carNum: '',
    plateNumber: '鄂',
    cityList: cityList,
    statusClass: '',
    coupon_show: '',
    coupons: [],
    coupon_index: -1, // -1表示没有或者不适用优惠券
    summary: { pay: 0.00, total: 0.00, goods: 0.00, discount: 0.00, workCost: 0.00 }
  },
  onLoad: function (opt) {
    objPage = this;
    var sets = {};
    sets.shopID = opt.shopID;
    sets.brandID = opt.brandID;
    sets.serieID = opt.seriesID;
    sets.modelID = opt.autoModelID;
    sets.token = opt.token;
    sets.itemsJSON = decodeURIComponent(opt.items);
    this.setData(sets);

    // 初始化:
    init();
  },
  carmask_show: function () {
    this.setData({ city_show: 'city_show' });
  },
  carmask_hide: function () {
    this.setData({ city_show: '' });
  },
  // carmask_hide: function () {
  //   hideCouponLayer()
  // },
  onClickCity: function (e) {
    var opt = e.currentTarget.dataset;
    var city = opt.text;
    this.setData({ current_city: city });
    //addClass removeClass
    var cityList = this.data.cityList;
    var index = opt.index;
    // 先removeclass
    cityList.map(function (item) {
      item.statusClass = '';
    })
    if (cityList[index].statusClass === '') {
      cityList[index].statusClass = 'on';
    }
    this.setData({ cityList: cityList });
  },
  coupon_show: function () {
    this.setData({ coupon_show: 'on' })
  },
  coupon_hide: function () {
    hideCouponLayer();
  },
  onNav: function (e) {
    onNav(e);
  },
  onClickDate: function (e) {
    this.setData({
      date: e.detail.value
    })
  },
  onClickTime: function (e) {
    this.setData({
      time: e.detail.value
    })
  },
  onChangeCarNum: function (e) {
    onChangeCarNum(e);
  },
  checkPlateNumber:function(e){

    var value = e.detail.value.toUpperCase();
    return {
      value: value.replace(/^[^a-zA-Z][^a-zA-Z0-9]*/g,"") //第一个必须是字母第二个可以是数字或字母
    }
  },
  onClickCoupon: function (e) {
    onClickCoupon(e);
    flushCoupon();
    hideCouponLayer();
  },
  onClearCoupon: function (e) {
    onClearCoupon()
    flushCoupon();
    hideCouponLayer();
  },
  onSubmit:function  (e) {
    submit(e);
  },
  choose_show:function(){
	    if(this.data.choose_show === ''){
	      this.setData({choose_show:'on'})
	    }else{
	      this.setData({choose_show:''})
	    }
	  },
    onPullDownRefresh: function (e) {
    wx.stopPullDownRefresh();
  }
})