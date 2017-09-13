var CFG = require('../../../../utils/config.js')
var common = require('../../../../utils/util.js')
var objPage = null;

Page({
  data: {
    instalment: null,
    fenqi: null
  },
  onLoad: function (options) {
    this.setData({car_source_no: options.car_source_no});
    // 页面初始化 options为页面跳转所带来的参数
    objPage = this;

    //获取分期购车本地缓存
    var instalment = wx.getStorageSync('item_instalment');
    objPage.setData({ instalment: instalment });
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
    wx.getStorage({
      key: 'new_car_info',
      success: function (res) {
        objPage.setData({ fenqi: res.data.instalment_id });
      }
    })

    var instalment = wx.getStorageSync('item_instalment');
    objPage.setData({ instalment: instalment });
  },
  onPullDownRefresh:function(){
    wx.stopPullDownRefresh()
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  onClickRadio: function (e) {
    //var id = e.currentTarget.dataset.car_source_no;
    var id = objPage.data.car_source_no;    //车源编号
    var ins_id = e.currentTarget.dataset.instalment_id;
    var item_instalment = wx.getStorageSync('item_instalment');
    if (id == item_instalment.car_source_no) {
      var instalList = item_instalment.item_insment;
      for (var i in instalList) {
        var r = instalList[i];
        i = parseInt(i) + 1;
        if (ins_id == i) {
          if(r.select == 'checked') {
            r.select = '';
            ins_id = '';
          } else {
            r.select = 'checked';
          }
          
        } else {
          r.select = '';
        }
      }
      item_instalment.item_insment = instalList;
      wx.setStorageSync('item_instalment', item_instalment);
    }
    
    stages(id, ins_id)
  }
})

//分期购车
function stages(id, ins_id) {
  //获取恒信质保本地缓存
  var qa_id = '';
  wx.getStorage({
    key: 'new_car_info',
    success: function (res) {
      if (res.data.qa_id) {
        qa_id = res.data.qa_id;
      }
      var url = CFG.USERDCAR_APP_API_HOST + 'BuyCar/getNewPrice';
      common.httpRequest(
        url, {
          pageLoading: true,
          data: {
            car_source_no: id,
            instalment_id: ins_id,
            qa_id: qa_id
          },
          success: function (res) {
            var statusCode = res.statusCode;
            var info = res.data.new_price;
            if (200 == statusCode && undefined !== info) {
              //分期购车计算本地缓存
              wx.setStorage({
                key: "new_car_info",
                data: { instalment_id: ins_id, qa_id: qa_id, new_car_price: info }
              })
            }
          }
        })
    }
  })

  //恒信质保,关闭当前页面，返回上一页面(列表页)
  wx.navigateBack({
    delta: 1
  })
}