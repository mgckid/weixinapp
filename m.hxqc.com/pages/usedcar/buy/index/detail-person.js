var CFG = require('../../../../utils/config.js')
var common = require('../../../../utils/util.js')
var objPage = null;
var car_sale = { '0': '待上架', '1': '上架', '2': '下架', '3': '已售', '4': '申请下架', '5': '被订购下架' };

Page({
  data: {},
  onLoad: function (opt) {
    // 页面初始化 options为页面跳转所带来的参数
    objPage = this;
    var id = opt.car_source_no;
    // 请求详情信息
    getBuyCarDetail(id);
  },
  onCall: function (e) {
    common.onCall(e);
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
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

//请求二手车个人发布详情数据
function getBuyCarDetail(id) {
  // 详情头部接口请求
  var url = CFG.USERDCAR_APP_API_HOST + 'BuyCar/queryItemDetail';
  common.httpRequest(
    url, {
      pageLoading: true,
      data: {
        car_source_no: id
      },
      success: function (res) {
        var statusCode = res.statusCode;
        var detailInfo = {};
        var info = res.data;
        if (200 == statusCode && undefined !== info) {
          //缓存车辆图片
          if(info.image.length > 0) {
              var car_image = info.image;
              wx.setStorage({
                key: 'car_img_list',
                data: car_image
              })
          }

          var tax_price = (parseFloat(info.new_car_price) + parseFloat(info.purchase)).toFixed(2);
          var economize = (parseFloat(tax_price) - parseFloat(info.estimate_price)).toFixed(2);
          info.tax_price = tax_price;
          info.economize = economize;
          info.img_length = info.image.length;
          info.first_on_card = common.formatDate(info.first_on_card, 'Y-MM');
          info.first_on_card_age = common.dateDiff(info.first_on_card);
          var timeList = info.recommend_car_source;
          for (var i in timeList) {
            var r = timeList[i];
            info.recommend_car_source[i].publish_time = common.formatDate(r.publish_time, 'MM-dd');
          }
          objPage.setData({ detailInfo: info });
        }
      }
    })

  //详情下部接口请求
  var urlButton = CFG.USERDCAR_APP_API_HOST + 'Mobile/carInfo';
  common.httpRequest(
    urlButton, {
      loading: false,
      data: {
        car_source_no: id
      },
      success: function (res) {
        var statusCode = res.statusCode;
        var detailButtonInfo = {};
        var info = res.data;
        if (200 == statusCode && !!info.carDetail) {
          //数据重组
          info.carDetail.detail.car_on_sale_name = car_sale[info.carDetail.detail.car_on_sale];
          objPage.setData({ detailButtonInfo: info });
        }
      }
    })

}

