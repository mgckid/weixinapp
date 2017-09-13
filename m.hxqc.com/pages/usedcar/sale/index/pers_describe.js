var common = require('../../../../utils/util.js')
var CFG = require('../../../../utils/config.js')
var token = '';
var mobile = '';
var objPage = null;

Page({
  data:{
    personDescribe: null
  },
  onLoad:function(opt){
    // 页面初始化 options为页面跳转所带来的参数
    objPage = this;
    token = wx.getStorageSync('token');
    mobile = wx.getStorageSync('login_name');
    if (token && mobile) {
        personDescribe(token, mobile, opt.car_source_no);
    }
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onPullDownRefresh:function(){
    wx.stopPullDownRefresh()
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  onCarDelete: function(e) {
    //删除我的车辆信息
    var car_no = e.currentTarget.dataset.car_source_no;
    wx.showModal({
      title: '提示',
      content: '确定删除吗',
      success: function(res) {
        if (res.confirm) {
          myCarDelete(car_no);
        } else if (res.cancel) {
          console.log('用户点击取消');
        }
      }
    })
  }
})

//自由发布车辆详情
function personDescribe(token, mobile, car_no) {
  var url = CFG.USERDCAR_APP_API_HOST + 'SellCar/carInfo';
  var timestamp = Date.parse(new Date())/1000;
  common.httpRequest(
    url,{
    data: {
      token: token,
      timestamp: timestamp,
      mobile: mobile,
      car_source_no: car_no
    },
    success: function (res) {
      var statusCode = res.statusCode;
      var data = res.data;
      if (200 == statusCode && undefined !== data) {
        data.publish_time = common.formatDate(data.publish_time, 'yyyy-MM-dd');
        objPage.setData({
          personDescribe: data
        });
      }
    }
  })
}

//删除我的车辆信息
function myCarDelete(car_no) {
  var url = CFG.USERDCAR_APP_API_HOST + 'SellCar/C_deleteitem';
  var timestamp = Date.parse(new Date())/1000;
  var post = {
    token: token,
    timestamp: timestamp,
    mobile: mobile,
    car_source_no: car_no
  }
  data = common.http_build_query(post);
  common.httpRequest(
    url,{
    data: data,
    method: 'POST',
    header: {
      'content-type': 'application/x-www-form-urlencoded'
      },
    success: function (res) {
      var statusCode = res.statusCode;
      var data = res.data;
      if (200 == statusCode && undefined !== data) {
        common.msg('删除车辆信息成功', '', function() {
          wx.navigateBack({
            delta: 1
          })
        });
      }
    }
  })
}