var CFG = require('../../../../utils/config.js')
var common = require('../../../../utils/util.js')
var objPage = null;
Page({
  data: {
    item_qa: null
  },
  onLoad: function (options) {
    this.setData({car_source_no: options.car_source_no});
    // 页面初始化
    objPage = this;
    wx.getStorage({
      key: 'item_qa',
      success: function (res) {
        var item_qa = res.data;
        if (item_qa.info_qa.length) {
          objPage.setData({ item_qa: res.data });
        }
      }
    })
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
  },
  onClickDetail: function () {
    common.msg('敬请期待');
  },
  onClickRadio: function (e) {
    //var id = e.currentTarget.dataset.car_source_no;
    var id = objPage.data.car_source_no;    //车源编号
    var ins_id = e.currentTarget.dataset.qa_id;

    var itemQa = wx.getStorageSync('item_qa');
    if (id == itemQa.car_source_no) {
      var itemQaList = itemQa.info_qa;
      for (var i in itemQaList) {
        var r = itemQaList[i];
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
      itemQa.info_qa = itemQaList;
      wx.setStorageSync('item_qa', itemQa)
    }

    qualitys(id, ins_id)
  }
})

//恒信质保
function qualitys(id, qa_id) {
  //获取分期本地缓存
  var ins_id = '';
  wx.getStorage({
    key: 'new_car_info',
    success: function (res) {
      if (res.data.instalment_id) {
        ins_id = res.data.instalment_id;
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
                data: { qa_id: qa_id, instalment_id: ins_id, new_car_price: info }
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