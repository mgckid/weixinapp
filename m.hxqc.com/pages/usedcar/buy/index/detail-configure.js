var CFG = require('../../../../utils/config.js')
var common = require('../../../../utils/util.js')
var objPage = null;

Page({
  data: {
    ul_open_info: 'open',
    ul_open_conf: '',
    ul_open_engine: '',
    ul_open_carb: '',
    ul_open_save: '',
    configData: null
  },
  onLoad: function (opt) {
    // 页面初始化 options为页面跳转所带来的参数
    objPage = this;
    var id = opt.car_source_no;
    paramConf(id);
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
  //显示隐藏
  ul_show: function (e) {
    var fType = e.currentTarget.dataset.filterType;
    switch (fType) {
      case 'info':
        if (this.data.ul_open_info == 'open') {
          this.setData({
            ul_open_info: '',
            ul_open_conf: '',
            ul_open_engine: '',
            ul_open_carb: '',
            ul_open_save: ''
          });
        } else {
          this.setData({
            ul_open_info: 'open',
            ul_open_conf: '',
            ul_open_engine: '',
            ul_open_carb: '',
            ul_open_save: ''
          });
        }
        break;
      case 'conf':
        if (this.data.ul_open_conf == 'open') {
          this.setData({
            ul_open_info: '',
            ul_open_conf: '',
            ul_open_engine: '',
            ul_open_carb: '',
            ul_open_save: ''
          });
        } else {
          this.setData({
            ul_open_info: '',
            ul_open_conf: 'open',
            ul_open_engine: '',
            ul_open_carb: '',
            ul_open_save: ''
          });
        }
        break;
      case 'engine':
        if (this.data.ul_open_engine == 'open') {
          this.setData({
            ul_open_info: '',
            ul_open_conf: '',
            ul_open_engine: '',
            ul_open_carb: '',
            ul_open_save: ''
          });
        } else {
          this.setData({
            ul_open_info: '',
            ul_open_conf: '',
            ul_open_engine: 'open',
            ul_open_carb: '',
            ul_open_save: ''
          });
        }
        break;
      case 'carb':
        if (this.data.ul_open_carb == 'open') {
          this.setData({
            ul_open_info: '',
            ul_open_conf: '',
            ul_open_engine: '',
            ul_open_carb: '',
            ul_open_save: ''
          });
        } else {
          this.setData({
            ul_open_info: '',
            ul_open_conf: '',
            ul_open_engine: '',
            ul_open_carb: 'open',
            ul_open_save: ''
          });
        }
        break;
      case 'save':
        if (this.data.ul_open_save == 'open') {
          this.setData({
            ul_open_info: '',
            ul_open_conf: '',
            ul_open_engine: '',
            ul_open_carb: '',
            ul_open_save: ''
          });
        } else {
          this.setData({
            ul_open_info: '',
            ul_open_conf: '',
            ul_open_engine: '',
            ul_open_carb: '',
            ul_open_save: 'open'
          });
        }
        break;
    }
  }
})

//参数配置
function paramConf(id) {
  // 详情头部接口请求
  var url = CFG.USERDCAR_APP_API_HOST + 'Mobile/carDetail';
  common.httpRequest(
    url, {
      pageLoading: true,
      data: {
        car_source_no: id
      },
      success: function (res) {
        var statusCode = res.statusCode;
        var configData = {};
        var data = res.data;
        if (200 == statusCode && undefined !== data.carDetail.detail) {
          //数据重组
          var zhongkong = data.carconfig['车内中控锁'] != '-' && data.carconfig['车内中控锁'] != null ? 1 : 0;
          var yaokong = data.carconfig['遥控钥匙'] != '-' && data.carconfig['遥控钥匙'] != null ? 2 : 0;
          switch (zhongkong + yaokong) {
            case 3:
              data.carconfig['zk'] = '中控锁、遥控钥匙';
              break;
            case 2:
              data.carconfig['zk'] = '遥控钥匙';
              break;
            case 1:
              data.carconfig['zk'] = '中控锁';
              break;
            case 0:
              data.carconfig['zk'] = '-';
              break;
          }

          data.carconfig['长*宽*高(mm)'] = data.carconfig['长*宽*高(mm)'].replace(/\*/g, "/");

          if (data.carconfig['主/副驾驶座安全气囊']) {
            data.carconfig['zhu'] = data.carconfig['主/副驾驶座安全气囊'].indexOf('主');
            if (data.carconfig['zhu'] > -1) {
              data.carconfig['zhu'] = '标配';
            } else {
              data.carconfig['zhu'] = '-';
            }
            data.carconfig['fu'] = data.carconfig['主/副驾驶座安全气囊'].indexOf('副');
            if (data.carconfig['fu'] > -1) {
              data.carconfig['fu'] = '标配';
            } else {
              data.carconfig['fu'] = '-';
            }
          } else {
            data.carconfig['zhu'] = '-';
            data.carconfig['fu'] = '-';
          }

          data.carDetail.detail.carAge = common.dateDiff(data.carDetail.detail.first_on_card); //车龄处理
          objPage.setData({ configData: data });
        }
      }
    })
}
