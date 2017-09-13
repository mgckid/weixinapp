// pages/shop/newcar/reply.js
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
        common.msg('您的询价信息已提交，我们将及时联系您进行报价','提示',function(){wx.navigateBack()});
      } else {
        common.msg('提交失败，请重试!');
      }
    }
  });
}

// 获取extID车型下面的车系列表
function getModelList(extID, brand, serie, model, shopSiteFrom) {
  var url = CFG.APP_API_HOST + '/Shop/V2/ShopModelPrice';
  common.httpRequest(url, {
    loading:false,
    pageLoading:true,
    data: { brand: brand, extID: extID, model: model, series: serie, shopSiteFrom: shopSiteFrom, siteID: CFG.SITE_ID },
    method: 'GET',
    success: function (res) {
      var statusCode = res.statusCode;
      var list = res.data;
      if (200 == statusCode && undefined !== list.modelList) {
        var modelList = list.modelList;
        var tmpIndex = 0;
        if (!!modelList.length) {
          for (var i in modelList) {
            if (extID == modelList[i].extID) {
              tmpIndex = i;
              break;
            }
          }
        }
        // 格式化价格
        if( !! list.shopInfoPrice){
          for(var i in list.shopInfoPrice){
              list.shopInfoPrice[i].modelPrice = common.formatMoney(list.shopInfoPrice[i].modelPrice);
          }
        }
        objPage.setData({ modelList: modelList, modelIndex: tmpIndex, shopList: list.shopInfoPrice });
      } else {
        common.msg('车型列表为空');
      }
    }
  });
}
Page({
  data: {
    showCounty:true,
    foucusName: true,
    foucusMobile: false,
    extID: '',
    modelIndex: 0,
    modelName: '',
    modelValue: '',
    modelList: [],
    shopList: []
  },
  onLoad: function (options) {
    objPage = this;
    var data = { modelName: options.model, extID: options.extID };
    this.setData(data);
    // 初始化车型列表
    getModelList(options.extID, options.brand, options.series, options.model, options.shopSiteFrom);
    // 侧滑地区
    citySlider.init(this);
  },
  onModelChange: function (e) {
    var sets = {};
    sets.modelIndex = e.detail.value;
    this.setData(sets);
  },
  onSubmit: function (opt) {
    
    var currentCity = this.getCurrentCity();
    var form = opt.detail.value;
    var data = {};
    data.city = currentCity.cityName;
    data.cityID = currentCity.cityID;
    data.exchange = 0;
    data.fullname = form.name;
    data.gender = form.radio_gender;
    data.messageType = 10;
    data.mobile = form.mobile;
    data.province = currentCity.provinceName;
    data.shopID = '';
    data.itemID = form.chk_item.join(',');
    // 判断是否勾选我同意
    if(0 == form.chk_agree.length){
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
