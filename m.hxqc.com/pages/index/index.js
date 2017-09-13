var common = require('../../utils/util.js')
var CFG = require('../../utils/config.js')
var objPage = null;

// banner图
function getBanners() {
  var url = CFG.APP_API_HOST + '/Mall/V2/Home/slideshow';
  common.httpRequest(url, {
    pageLoading: true,
    data: { key: 'index_app_v1080x436' },
    success: function (res) {
      var statusCode = res.statusCode;
      var list = res.data;
      if (!!list.length) {
        objPage.setData({ imgUrls: list });
      }
    }
  })
}

function onClickRepair(e) {
  // 获取缓存：
  var k = 'maintain_repair_default_model_info';
  var default_model = wx.getStorageSync(k);
  if (undefined !== default_model && undefined !== default_model.brandName) {
    wx.navigateTo({ url: '/pages/maintain/repair/list' })
  } else {
    wx.navigateTo({ url: '/pages/maintain/repair/filter' })
  }
}

Page({
  data: {
    tmpSrc1: '',
    imgUrls: [],
    newsList: [],
    indicatorDots: true, // 是否显示点
    autoplay: true, // 自动播放
    interval: 3000, // 自动切换时间间隔 
    duration: 500 // 滑动动画时长
  },
  onShow:function(e) {
    common.checkGoTo();
  },
  onLoad: function () {
    objPage = this;
    getBanners();
  },
  onPullDownRefresh: function (e) {
    getBanners();
    wx.stopPullDownRefresh();
  },
  onSwiperChange: function (e) {
  }, onShareAppMessage: function () {
    return {
      title: '恒信汽车管家',
      desc: CFG.SHARE_DESC,
      path: '/pages/index/index'
    }
  },
  onClickWait: function () {
    common.msg('敬请期待 :)');
  },
  onCall: function (e) {
    common.onCall(e);
  },
  onClickRepair: function (e) {
    onClickRepair(e);
  }
})
