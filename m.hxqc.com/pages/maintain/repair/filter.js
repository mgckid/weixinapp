var common = require('../../../utils/util.js')
var CFG = require('../../../utils/config.js')
var objPage = null;

// 获取品牌列表
function getBrands() {
  var url = CFG.MAINTAIN_APP_API_HOST + 'Auto/brands';
  common.httpRequest(url, {
    data: { shopID: '' },
    success: function (res) {
      var statusCode = res.statusCode;
      var brandList = res.data;
      var currentCache = [];
      if (200 == statusCode && brandList.length) {
        objPage.setData({ brandList: brandList });
      } else {
        common.msg('品牌列表为空');
      }
    },
  })
}

// 获取车系列表
function getSeries(brand, brandID) {
  var url = CFG.MAINTAIN_APP_API_HOST + 'Auto/seriess';
  common.httpRequest(url, {
    data: { brand: brand, brandID: brandID },
    success: function (res) {
      var statusCode = res.statusCode;
      var serieList = res.data;
      var currentCache = [];
      if (200 == statusCode && undefined !== serieList.length) {
        objPage.setData({ serieList: serieList, switch_slide_on_serie: 'on' });
      } else {
        common.msg('车系列表为空');
      }
    },
  })
}

// 获取车型列表
function getModelList(brand, brandID, series, seriesID) {
  var url = CFG.MAINTAIN_APP_API_HOST + 'Auto/modelN';
  common.httpRequest(url, {
    data: { brand: brand, brandID: brandID, series: series, seriesID: seriesID },
    success: function (res) {
      var statusCode = res.statusCode;
      var modelList = res.data;
      if (200 == statusCode && undefined !== modelList.length) {
        objPage.setData({ modelList: modelList, switch_slide_on_model: 'on' });
      } else {
        common.msg('车型列表为空');
      }
    },
  })
}

// 点击车系事件
function onClickSerie(e) {
  var opt = e.currentTarget.dataset;
  // 初始化：
  objPage.setData({ modelList: [], serie: opt.serie, serieID: opt.serieId, subBrand: opt.subBrand });

  // 请求车型列表+展开车型列表：
  getModelList(opt.brand, opt.brandId, opt.serie, opt.serieId);
}

// 点击返回按钮:[车系，车型]
function onClickBack(e) {
  var opt = e.currentTarget.dataset;
  var c_type = opt.type;
  switch (c_type) {
    case 'serie':
      objPage.setData({ switch_slide_on_serie: '' });
      break;
    case 'model':
      objPage.setData({ switch_slide_on_model: '' });
      break;
    default:
      break;
  }
}

// 缓存最后一次选择的车型信息，作为默认修车车型[同步方式缓存]
function cacheLastModelInfo(brandName, brandThumb, subBrand, serieName, modelName, brandID, serieID, modelID) {
  var k = 'maintain_repair_default_model_info';
  var info = { brandName: brandName, img: brandThumb, subBrand: subBrand, serieName: serieName, modelName: modelName, brandID: brandID, serieID: serieID, modelID: modelID };

  try {
    wx.setStorageSync(k, info);
  } catch (e) {
    common.msg('缓存车型信息失败!');
  }
}

function onClickModel(e) {
  var opt = e.currentTarget.dataset;
  // 缓存最后一次选中的车型信息：
  cacheLastModelInfo(objPage.data.click_brand, objPage.data.click_brand_img, objPage.data.subBrand, opt.serie, opt.model, opt.brandId, opt.serieId, opt.modelId);

  // 页面路由
  var url = '';
  switch (objPage.data.http_ref) {
    case 'maintain':
      url = '/pages/maintain/index/choose/index';
      break;
    case 'maintain_addcar':
      url = '/pages/maintain/index/addcar/index';
      break;
    default:
      url = '/pages/maintain/repair/list?brand=' + opt.brand + '&brandID=' + opt.brandId + '&serie=' + opt.serie + '&serieID=' + opt.serieId + '&model=' + opt.model + '&modelID=' + opt.modelId;
  }
  wx.redirectTo({ url: url });
}

Page({
  data: {
    http_ref: '', // maintain | repair => 来源于保养还是修车预约
    click_brand_img: '',
    click_brand: '',
    brand: '',
    subBrand: '',
    brandID: '',
    serie: '',
    serieID: '',
    brandList: [],
    modelList: [],
    switch_slide_on_serie: '',
    switch_slide_on_model: ''
  },
  onLoad: function (opt) {
    objPage = this;
    var http_ref = opt.type;
    objPage.setData({ http_ref: http_ref });

    getBrands();
  },
  onClickBrand: function (e) {
    // 点击品牌
    var opt = e.currentTarget.dataset;
    var brand = opt.brand;
    var brandID = opt.brandId;
    var brandImg = opt.img;

    // 缓存选中的品牌信息
    this.setData({ click_brand: brand, click_brand_img: brandImg });

    // 缓存：
    this.setData({ brand: brand, brandID: brandID });
    if (brand) {
      this.setData({ serieList: [], modelList: [], switch_slide_on_model: '' });
      // 获取车系列表
      getSeries(brand, brandID);
    } else {
      common.msg('请选择品牌');
    }
  },
  stopPass: function (e) {
  },
  onClickSerie: function (e) {
    onClickSerie(e);
  },
  onClickBack: function (e) {
    onClickBack(e);
  },
  onClickModel: function (e) {
    onClickModel(e);
  },
  onPullDownRefresh: function (e) {
    wx.stopPullDownRefresh();
  }
})