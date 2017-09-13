var CFG = require('../../../../utils/config.js')
var common = require('../../../../utils/util.js')
var citySlider = require('../../../../utils/citySlider/index.js');
var tool = require('../../../../utils/md5.js');
var objPage = null;

Page({
  data:{
    switch_slide_on:"",
    switch_local_on:"",
    switch_chexi_on:"",
    index: 0,
    mobile: null,
    mobile_disabled: false,
    name: '',
    brand: null,
    brandName: null,
    serieName: null,
    serie: null,
    brandData: null,
    serieData: null,
    userdCarUrl: ''
  },
  onLoad: function (options) {
    objPage = this;
    // 城市侧滑插件初始化：
    citySlider.init(this);
    // 获取选中的城市信息：
    this.getCurrentCity();
  },
  onShow: function () {
    // 页面显示
    var mobile = wx.getStorageSync('login_name');
    var token = wx.getStorageSync('token');
    if(mobile && token) {
      getUserInfo(token);
      objPage.setData({
        mobile: mobile,
        mobile_disabled: true
      });
    } 
  },
  onPullDownRefresh:function(){
    wx.stopPullDownRefresh()
  },
  onClickBrand: function (e) {
    //获取品牌
      this.setData({
        switch_slide_on:"on"
        });
        getBrand();

        
  },
  onClickLocal: function (e) {
      this.setData({
        switch_local_on:"on"
        });
  },
  onClickHide: function (e) {
      this.setData({
        switch_slide_on:"",
        switch_local_on:"",
        switch_chexi_on:""
        });
  },
  onClickChexi: function (e) {
    //获取车系
      this.setData({
        switch_chexi_on:"on",
        switch_slide_on:""
        });
      var brandId = e.currentTarget.dataset.brandId;
      var brandName = e.currentTarget.dataset.brandName;
      objPage.setData({ brand: brandId });
      objPage.setData({ brandName: brandName });
      getSerie(brandId);
            
  },
  onClickSerie: function(e) {
    //车系数据获取
    this.setData({
        switch_chexi_on:"",
        });
    var serieId = e.currentTarget.dataset.serieId;
    var serieName = e.currentTarget.dataset.serieName;
    objPage.setData({ serie: serieId });
    objPage.setData({ serieName: serieName });
  },
  onSubmit: function(e) {
    //平台帮卖提交预约
    subscribe(e.detail.value);
  },
  mobileBlur: function (e) {
    //设置输入的手机号
    this.setData({ mobile: e.detail.value })
  },
  onSendVerify: function (opt) {
    //发送验证码
    var sendtype = opt.currentTarget.dataset.sendtype;
    var username = this.data.mobile;
    sendVerify(username, sendtype);
  },
  bindPickerChange: function (e) {
    var sets = {};
    sets.index = e.detail.value;
    this.setData(sets);
  },
  onCall: function(e) {
    common.onCall(e);
  }
})

//发送验证码
function sendVerify(mobile, code) {
  //手机号验证
  var chk_phone = common.validReg('mobile', mobile);
  if (!chk_phone) {
    //common.msg('手机号码格式不正确');
    return false;
  }

  var url = CFG.USERDCAR_APP_API_HOST + 'Common/captcha';
  common.httpRequest(
    url,{
    data: {
      username: mobile,
      sendType: code,
      useType: 10
    },
    success: function (res) {
      var statusCode = res.statusCode;
      var info = res.data;
      if (200 == statusCode && undefined !== info) {
        if(info.code == '0') {
          common.msg(info.message);
        }
      }
    }
  })
}

//获取品牌
function getBrand() {
  var url = CFG.USERDCAR_APP_API_HOST + 'Common/getGroupBrand';
    common.httpRequest(
      url,{
      data: {
      },
      success: function (res) {
        var statusCode = res.statusCode;
        var data = res.data;
        var brandData = {};
        if (200 == statusCode && undefined !== data.length) {
          objPage.setData({ brandData: data });
        }
      }
    })
}

//获取车系
function getSerie(brand) {
  var url = CFG.USERDCAR_APP_API_HOST + 'Common/getSerieModel';
    common.httpRequest(
      url,{
      data: {
        brand_id: brand
      },
      success: function (res) {
        var statusCode = res.statusCode;
        var data = res.data;
        var brandData = {};
        if (200 == statusCode && undefined !== data.length) {
          objPage.setData({ serieData: data });
        }
      }
    })
}

//获取登陆信息
function getUserInfo(token) {
  // 提交验证
  var url = CFG.APP_API_HOST + 'Account/V2/Users';
  common.httpRequest(url, {
    data: {token: token},
    success: function (res) {
      var name = res.data.fullname;
      if(name && name !== undefined) {
        objPage.setData({ name: name});
      }
    }
  })
}

//平台帮卖提交预约
function subscribe(data) {
    var name = data.name;
    var mobile = objPage.data.mobile;
    var captcha = data.captcha;
    var citys =objPage.getCurrentCity();
    var province = citys.provinceID;
    var city = citys.cityID;
    var brand = objPage.data.brand;
    var serie = objPage.data.serie;
    var other = data.other;

    //联系人验证
    var chk_name = common.validReg('username', name);
    if (!chk_name) {
      //common.msg('请输入正确的姓名');
      return false;
    }

    //手机号验证
    var chk_phone = common.validReg('mobile', mobile);
    if (!chk_phone) {
      //common.msg('手机号码格式不正确');
      return false;
    }

    //验证码
    var chk_captcha = common.validReg('captcha', captcha);
    if (!chk_captcha) {
      //common.msg('请输入正确的验证码');
      return false;
    }

    //数据效验
    var key = CFG.INTERFACE_KEY.PLATFORMSELL;
    var timestamp = Date.parse(new Date())/1000;
    var effectData = [mobile, 'PLATFORMSELL', timestamp];
    effectData.sort();
    var effectDataStr = effectData.join(key);
    var sign = tool.md5(effectDataStr);
    
    var post ={
        name: name, 
        mobile: mobile, 
        captcha: captcha, 
        brand: objPage.data.brand, 
        serie: objPage.data.serie, 
        province: province, 
        city: city, 
        other: other, 
        operation: 'PLATFORMSELL',
        timestamp: timestamp, 
        sign: sign
      };
    data = common.http_build_query(post);
    var url = CFG.USERDCAR_APP_API_HOST + 'SellCar/P_platformSell';
    common.httpRequest(
      url,{
      data:data ,
      method: 'POST',
      header: {
      'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var statusCode = res.statusCode;
        var info = res.data;
        if (200 == statusCode) {
          common.msg('提交成功', '', function() {
            wx.navigateBack({
              delta: 1
            })
          });
        } else {
            common.msg(info.message);
            return false;
        }
        objPage.setData({ switch_show: '' })
      }
    })
}
