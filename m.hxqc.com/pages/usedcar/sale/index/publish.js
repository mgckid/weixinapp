var common = require('../../../../utils/util.js')
var CFG = require('../../../../utils/config.js')
var citySlider = require('../../../../utils/citySlider/index.js');
var tool = require('../../../../utils/md5.js');
var imgList = {};
var token = '';
var mobile = '';
var formData = null;
var objPage = null;

//获取品牌
function getBrand() {
  var url = CFG.USERDCAR_APP_API_HOST + 'Common/getGroupBrand';
  common.httpRequest(
    url, {
      pageLoading: true,
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
function getSerie(brandId) {
  var url = CFG.USERDCAR_APP_API_HOST + 'Common/getSerieModel';
  common.httpRequest(
    url, {
      pageLoading: true,
      data: {
        brand_id: brandId
      },
      success: function (res) {
        var statusCode = res.statusCode;
        var data = res.data;
        if (200 == statusCode && undefined !== data.length) {

          //异步缓存车系车型数据
          wx.setStorage({
            key: "serieList",
            data: data
          })
          objPage.setData({ serieData: data });
        }
      }
    })
}

//表单颜色、车辆级别、变速箱等条件
function getChoose() {
  var url = CFG.USERDCAR_APP_API_HOST + 'SellCar/C_getChoose';
  common.httpRequest(
    url, {
      pageLoading: true,
      data: {
      },
      success: function (res) {
        var statusCode = res.statusCode;   //请求数据返回状态码
        var filtrData = res.data;          //列表数据
        if (200 == statusCode) {
          objPage.setData({ saleFilter: filtrData });
        } 
      }
    });
};

//车型ID拉相关明细数据
function getModelInfo(modelId) {
  var url = CFG.USERDCAR_APP_API_HOST + 'SellCar/C_getInfoByModel';
  common.httpRequest(
    url, {
      pageLoading: true,
      data: {
        model_id: modelId
      },
      success: function (res) {
        var statusCode = res.statusCode;   //请求数据返回状态码
        var modelData = res.data;          //列表数据
        if (200 == statusCode && undefined !== modelData) {
          if (modelData.displacement) {
            objPage.setData({ dis_disabled: true, displacement: modelData.displacement });
          }
          if (modelData.new_car_price) {
            objPage.setData({ new_car_price_disabled: true, new_car_price: modelData.new_car_price });
          }
          if (modelData.gearbox) {
            objPage.setData({ gearbox: modelData.gearbox });
          }
          if (modelData.level) {
            objPage.setData({ level: modelData.level });
          }
        }
      }
    });
}

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
    url, {
      pageLoading: true,
      data: {
        username: mobile,
        sendType: code,
        useType: 30
      },
      success: function (res) {
        var statusCode = res.statusCode;
        var info = res.data;
        if (200 == statusCode && undefined !== info) {
          if (info.code == '0') {
            common.msg(info.message);
          }
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
      var phone = res.data.phoneNumber;
      var avatar = res.data.avatar;
      var nickName = res.data.nickName;
      var code = res.data.code;
      var msg = res.data.message;
      var realName = res.data.fullname;
      if(realName && realName !== undefined) {
        objPage.setData({ contacts: realName, real_disabled: true});
      }
    }
  })
}

//获取我的车辆信息
function myCarInfo(myCarId) {
  token = wx.getStorageSync('token');
  mobile = wx.getStorageSync('login_name');
  if (!token || !mobile) {
    wx.navigateTo({
      url: '/pages/user/login/index'
    })
  }
  var url = CFG.USERDCAR_APP_API_HOST + 'SellCar/C_getDetail';
  var timestamp = Date.parse(new Date()) / 1000;
  common.httpRequest(
    url, {
      pageLoading: true,
      data: {
        token: token,
        timestamp: timestamp,
        mobile: mobile,
        car_source_no: myCarId
      },
      success: function (res) {
        var statusCode = res.statusCode;
        var data = res.data;
        if (200 == statusCode && undefined !== data) {
          getModelInfo(data.model_id);

          //编辑时的图片处理
          var coverInfo = data.cover;
          var upimageList = {};
          for (var i in data.image) {
            var r = data.image[i];
            if (i == '0' && r.name) {
              objPage.setData({ on1: 'on' });
            }
            if (i == '1' && r.name) {
              objPage.setData({ on2: 'on' });
            }
            if (i == '2' && r.name) {
              objPage.setData({ on3: 'on' });
            }
            if (i == '3' && r.name) {
              objPage.setData({ on4: 'on' });
            }
            if (i == '4' && r.name) {
              objPage.setData({ on5: 'on' });
            }

            //编辑时的图片显示
            switch (i) {
              case '0':
                objPage.setData({ image1: r.small_path });
                break;
              case '1':
                objPage.setData({ image2: r.small_path });
                break;
              case '2':
                objPage.setData({ image3: r.small_path });
                break;
              case '3':
                objPage.setData({ image4: r.small_path });
                break;
              case '4':
                objPage.setData({ image5: r.small_path });
                break;
            }
            i = parseInt(i) + 1;
            var newPath = r.path.substring(r.path.lastIndexOf('salecars'));
            if (coverInfo == r.name) {
              imgList['image' + i] = { key: 'image' + i, original: 'cover', filename: r.name, path: newPath };
            } else {
              imgList['image' + i] = { key: 'image' + i, original: '', filename: r.name, path: newPath };
            }
          }
          if (data.license) {
            objPage.setData({ license: data.license });
          }
          if (data.license1) {
            objPage.setData({ license1: data.license1 });
          }
          if (data.license2) {
            objPage.setData({ license2: data.license2 });
          }

          //编辑时的封面显示
          if (data.cover) {
            for (var i in data.image) {
              var r = data.image[i];
              if (data.cover == r.name) {
                switch (i) {
                  case '0':
                    objPage.setData({ select1: 'select' });
                    break;
                  case '1':
                    objPage.setData({ select2: 'select' });
                    break;
                  case '2':
                    objPage.setData({ select3: 'select' });
                    break;
                  case '3':
                    objPage.setData({ select4: 'select' });
                    break;
                  case '4':
                    objPage.setData({ select5: 'select' });
                    break;
                }
              }
            }
            objPage.setData({ cover: data.cover });
          }

          //数据组装
          objPage.setData({
            car_source_no: data.car_source_no,
            brand: data.brand_id,
            serie: data.serie_id,
            model: data.model_id,
            addbrand: data.addbrand,
            addserie: data.addserie,
            addmodel: data.addmodel,
            car_color: data.car_color,
            level: data.level,
            gearbox: data.gearbox,
            new_car_price: data.new_car_price,
            displacement: data.displacement,
            estimate_price: data.estimate_price,
            contacts: data.contacts,
            mibile: data.mibile,
            owners_text: data.owners,
            look_address: data.look_address
          })

          var my_car_name = data.brand + ' ' + data.serie + ' ' + data.model;
          var my_add_car_name = data.addbrand + ' ' + data.addserie + ' ' + data.addmodel;
          // data.my_car_name = my_car_name;
          // data.my_add_car_name = my_add_car_name;
          if (!my_car_name) {
            my_car_name = my_add_car_name;
          }

          var provinceList = objPage.data.list_provinces;
          if (data.province_id) {
            for (var i in provinceList) {
              var r = provinceList[i];
              if (r.id == data.province_id) {
                var index_province = i;
                var index_province_name = r.name;
              }
            }
            objPage.setData({
              index_province: index_province,
              index_province_id: data.province_id,
              index_province_name: data.province ? data.province : index_province_name
            });
          }

          var cityList = common.getCitys(data.province_id);
          if (data.city_id) {
            for (var i in cityList) {
              var r = cityList[i];
              if (r.id == data.city_id) {
                var index_city = i;
                var index_city_name = r.name;
              }
            }
            objPage.setData({
              index_city: index_city,
              index_city_id: data.city_id,
              list_citys: cityList,
              index_city_name: data.city ? data.city : index_city_name
            });
          }

          if (data.first_on_card && data.first_on_card != '0000-00-00') {
            objPage.setData({ first_on_card: data.first_on_card });
          }
          if (data.inspection_date && data.inspection_date != '0000-00-00') {
            objPage.setData({ inspection_date: data.inspection_date });
          }
          if (data.sali_date && data.sali_date != '0000-00-00') {
            objPage.setData({ sali_date: data.sali_date });
          }
          if (data.insurance_date && data.insurance_date != '0000-00-00') {
            objPage.setData({ insurance_date: data.insurance_date });
          }
          if (data.warranty_date) {
            objPage.setData({ warranty_date: data.warranty_date });
          }
          var licenseNo = data.car_license_no;
          if (licenseNo) {
            var license_area = licenseNo.substring(0, 1);
            var license_number = licenseNo.substring(1);
            objPage.setData({
              license_area: license_area,
              license_number: license_number
            });
          }

          var sliderData = objPage.data.sliderConfig;
          for (var i in sliderData.provinces) {
            var r = sliderData.provinces[i];
            if (r.id == data.location_province_id) {
              sliderData.provinceIndex = i;
              var location_province = r.name;
            }
          }

          var loca_citys = common.getCitys(data.location_province_id);
          sliderData.citys = loca_citys;
          for (var i in loca_citys) {
            var r = loca_citys[i];
            if (r.id == data.location_city_id) {
              sliderData.cityIndex = i;
              var location_city = r.name;
            }
          }
          var loca_countys = common.getCountys(parseInt(data.location_province_id), parseInt(data.location_city_id));
          sliderData.countys = loca_countys;
          for (var i in loca_countys) {
            var r = loca_countys[i];
            if (r.id == data.location_region_id) {
              sliderData.countyIndex = i;
              var location_county = r.name;
            }
          }

          var province_city_region = data.location_province + data.location_city + data.location_region;
          var province_city_county = location_province + location_city + location_county;
          sliderData.value = province_city_region ? province_city_region : province_city_county;
          objPage.setData({
            sliderConfig: sliderData,
            carInfo: data,
            modelname: my_car_name
          });
        }
      }
    })
}

//个人发布表单提交
function subPublish(data) {
  var brand = objPage.data.brand;
  var serie = objPage.data.serie;
  var model = objPage.data.model;
  var addbrand = objPage.data.addbrand;
  var addserie = objPage.data.addserie;
  var addmodel = objPage.data.addmodel;

  token = wx.getStorageSync('token');
  
  if ((!brand || !serie || !model) && (!addbrand || !addserie || !addmodel)) {
    wx.showModal({ title: '提示', content: '请填写品牌车型', showCancel: false });
    return false;
  }
  var car_color = objPage.data.car_color;
  if (!car_color) {
    common.msg('请选择车身颜色');
    return false;
  }
  var level = objPage.data.level;
  if (!level || level == '请选择') {
    common.msg('请选择车辆级别');
    return false;
  }
  var gearbox = objPage.data.gearbox;
  if (!gearbox || gearbox == '请选择') {
    common.msg('请选择变速箱');
    return false;
  }
  if (!data.displacement) {
    common.msg('请输入排量');
    return false;
  }

  var province = objPage.data.index_province_id;
  var city = objPage.data.index_city_id;
  if (!province) {
    common.msg('请选择车牌所在地');
    return false;
  }
  var car_mileage = data.car_mileage;
  if (!car_mileage) {
    common.msg('请输入表显里程');
    return false;
  }
  var first_on_card = objPage.data.first_on_card;
  if (!first_on_card) {
    common.msg('请选择首次上牌时间');
    return false;
  }
  var estimate_price = data.estimate_price;
  if (!estimate_price) {
    common.msg('请输入预售价格');
    return false;
  }
  var contacts = data.contacts;
  var chk_contacts = common.validReg('username', contacts);
  if (!chk_contacts) {
    return false;
  }
  var phone_num = data.phone_num;
  if(!phone_num) {
    var phone_num = common.validReg('mobile', phone_num);
    if (!phone_num) {
      return false;
    }
  }
  var verify = data.verify;
  var chk_verify = common.validReg('captcha', verify);
  if (!chk_verify) {
    return false;
  }

  var cityInfo = objPage.getCurrentCity();
  var location_province = cityInfo.provinceID;
  var location_city = cityInfo.cityID;
  var location_region = cityInfo.countyID;

  if (!location_province) {
    wx.showModal({ title: '提示', content: '请选择看车地点', showCancel: false });
    wx.hideToast()
    return;
  }
  if (!imgList) {
    wx.showModal({ title: '提示', content: '请最少上传一张车主实拍照片', showCancel: false });
    wx.hideToast()
    return;
  }
  var cover = objPage.data.cover;
  if (!cover) {
    wx.showModal({ title: '提示', content: '请选择一张封面图', showCancel: false });
    wx.hideToast()
    return;
  }

  //imgList = JSON.stringify(imgList);

  var url = CFG.USERDCAR_APP_API_HOST + 'SellCar/C_submitCarInfo';
  var car_license = data.license_area + data.license_number;
  //数据效验
  var key = CFG.INTERFACE_KEY.SELL_CAR;
  var timestamp = Date.parse(new Date()) / 1000;
  var effectData = [mobile, 'SELL_CAR', timestamp];
  effectData.sort();
  var effectDataStr = effectData.join(key);
  var sign = tool.md5(effectDataStr);

  
  // if (!token || !mobile) {
  //   wx.navigateTo({
  //     url: '/pages/user/login/index'
  //   })
  // } else {
    var post = {
    car_source_no: objPage.data.car_source_no,
    addbrand: addbrand,
    addserie: addserie,
    addmodel: addmodel,
    brand: brand,
    serie: serie,
    model: model,
    car_color: car_color,
    car_license_no: car_license,
    car_mileage: car_mileage,
    car_source_no: data.car_source_no,
    province: province,
    city: city,
    phone_num: phone_num,
    contacts: contacts,
    cover: cover,
    delete: objPage.data.img_delete,
    displacement: data.displacement,
    estimate_price: estimate_price,
    first_on_card: objPage.data.first_on_card,
    gearbox: gearbox,
    license_area: objPage.data.license_area,
    license_number: data.license_number,
    imagelist: imgList,
    inspection_date: objPage.data.inspection_date,
    insurance_date: objPage.data.insurance_date,
    level: level,
    location_province: location_province,
    location_city: location_city,
    location_region: location_region,
    look_address: data.look_address,
    mobile: phone_num,
    verify: verify,
    token: token,
    new_car_price: data.new_car_price,
    owners: objPage.data.owners_text,
    purchase: '',
    sali_date: objPage.data.sali_date,
    warranty_date: objPage.data.warranty_date,
    timestamp: timestamp,
    sign: sign,
    wx: 10
  };

  console.log(post);

  data = common.http_build_query(post);
  common.httpRequest(
    url, {
      pageLoading: true,
      data: data,
      method: 'POST', 
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var statusCode = res.statusCode;   //请求数据返回状态码56456
        var modelData = res.data;          //列表数据
        if (200 == statusCode) {
          formData = null;
          common.msg('提交成功', '', function () {
            wx.redirectTo({
              url: '/pages/usedcar/sale/index/personage'
            })
          });
        } else {
          console.log(res);
          common.msg(modelData.message);
          return false;
        }
      }
    });
  //}

  
}


Page({
  data: {
    showCounty: true,// 显示城市侧滑插件的区(县)
    switch_slide_on: "",
    switch_local_on: "",
    switch_color_on: "",
    switch_level_on: "",
    switch_speed_on: "",
    switch_cityshow: "",
    switch_chexi_on: "",
    switch_serie_on: "",
    switch_model_on: "",
    switch_upload_on: "",
    switch_cover_show: "",
    addbrand_show: '',
    switch_self_on: '',
    show_text: "上传证件照，提升信息完整度",
    index: 0,
    displacement: '',
    new_car_price: '',
    level: "",
    gearbox: "",
    saleFilter: [],
    brandData: null,
    serieData: null,
    modelData: null,
    brand: '',
    serie: '',
    model: '',
    addbrand: '',
    addserie: '',
    addmodel: '',
    modelname: '请选择品牌车型，没有则点击添加即可',
    car_color: '',
    car_colorcode: '',
    areaList: '',
    license_area: '鄂',
    phone_num: '',
    contacts: '',
    first_on_card: '',
    inspection_date: '',
    sali_date: '',
    insurance_date: '',
    warranty_date: '',
    index_province: 11,
    index_province_id: 13,
    index_province_name: '湖北省',
    list_provinces: [],
    index_city: 0,
    index_city_id: 180,
    index_city_name: '武汉市',
    list_citys: [],
    token: '',
    mobile: '',
    image1: '',
    image2: '',
    image3: '',
    image4: '',
    image5: '',
    license: '',
    license1: '',
    license2: '',
    on1: '',
    on2: '',
    on3: '',
    on4: '',
    on5: '',
    on6: '',
    on7: '',
    on8: '',
    cover: '',
    dis_disabled: false,
    new_car_price_disabled: false,
    phone_num_disabled: false,
    real_disabled: false,
    select1: '',
    select2: '',
    select3: '',
    select4: '',
    select5: '',
    selectnum: '',
    input_length: '0',
    teach_text: '',
    owners_text: '',
    carInfo: {},
    car_source_no: '',
    img_delete: '',
    look_address: '',
    showCounty:true,
    gallaryOn:'',
    gallarySrc:''
  },
  onLoad: function (opt) {
    // 页面初始化 options为页面跳转所带来的参数
    objPage = this;
    // 城市侧滑插件初始化：
    citySlider.init(this);
    // 获取选中的城市信息：
    var region = this.getCurrentCity();
    var list_provinces = common.getProvinces();     //默认所有省列表
    var list_citys = common.getCitys(13);   //默认武汉市列表
    objPage.setData({
      list_provinces: list_provinces,
      list_citys: list_citys
    });

    var myCarId = opt.car_source_no;

    if (myCarId) {
      myCarInfo(myCarId);
    }

    getChoose();    //表单颜色、车辆级别、变速箱等条件
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    mobile = wx.getStorageSync('login_name');
    var token = wx.getStorageSync('token');
    if(mobile && token) {
      getUserInfo(token);
      objPage.setData({
        mobile: mobile,
        phone_num_disabled: true
      });
    } 
    // // 页面显示
    // if(formData) {
    //   subPublish(formData);
    // }
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
  onClickBrand: function (e) {
    getBrand();
    this.setData({
      switch_slide_on: "on"
    });
  },
  onClickChexi: function (e) {
    this.setData({
      switch_chexi_on: "on",
      switch_slide_on: ""
    });
    var brandId = e.currentTarget.dataset.brandId;
    var brandName = e.currentTarget.dataset.brandName;
    objPage.setData({
      brand: brandId,
      modelname: brandName
    });
    getSerie(brandId);
  },
  onClickSerie: function (e) {
    this.setData({
      switch_model_on: "on",
      switch_chexi_on: ""
    });
    var serieId = e.currentTarget.dataset.serieId;
    objPage.setData({ serie: serieId });
    var serieName = e.currentTarget.dataset.serieName;
    var brandName = objPage.data.modelname;
    objPage.setData({ modelname: brandName + ' ' + serieName });

    //获取缓存车系车型数据
    wx.getStorage({
      key: 'serieList',
      success: function (res) {
        if (res.data) {
          for (var i in res.data) {
            var r = res.data[i];
            if (serieId == r.serie_id) {
              var models = r.model;
            }
          }
          objPage.setData({ modelData: models });
        }
      }
    })
  },
  ftrAddbrand: function () {
    this.setData({ addbrand_show: 'on' })
  },
  onClickModel: function (e) {
    this.setData({
      switch_model_on: ""
    });
    var modelId = e.currentTarget.dataset.modelId;
    objPage.setData({ model: modelId });
    var modelName = e.currentTarget.dataset.modelName;
    var serieName = objPage.data.modelname;
    objPage.setData({ modelname: serieName + ' ' + modelName });

    //车型ID拉相关明细数据
    getModelInfo(modelId);
  },
  onClickRegion: function (e) {
    //车牌所在地
    this.setData({
      switch_region_on: "on"
    })
  },
  onClickaddModelName: function (e) {
    this.setData({
      addbrand_show: "",
      brand: '',
      serie: '',
      model: '',
      new_car_price_disabled: false,
      dis_disabled: false,
      modelname: objPage.data.addbrand + ' ' + objPage.data.addserie + ' ' + objPage.data.addmodel
    });
  },
  onClickHide: function (e) {
    this.setData({
      switch_slide_on: "",
      switch_level_on: "",
      switch_speed_on: "",
      switch_chexi_on: "",
      switch_serie_on: "",
      switch_model_on: "",
      switch_region_on: "",
      switch_cover_show: "",
      addbrand_show: "",
      gallaryOn: ""
    });
  },
  onClickColor: function (e) {
    this.setData({
      switch_color_on: "on"
    });
  },
  onClickColorSub: function (e) {
    //车身颜色侧滑
    var carcolor = e.currentTarget.dataset.carcolor;
    var carcolorcode = e.currentTarget.dataset.carcolorcode;
    this.setData({
      switch_color_on: "",
      car_color: carcolor,
      car_colorcode: carcolorcode
    });
  },
  onClickChoose: function (e) {
    this.setData({
      switch_color_on: ""
    });
  },
  onClickLevel: function (e) {
    //车辆级别展开侧滑
    if (objPage.data.level && objPage.data.level != '请选择') {
      this.setData({
        switch_level_on: "",
      });
    } else {
      this.setData({
        switch_level_on: "on",
      });
    }
  },
  onClickLevelSub: function (e) {
    //车辆级别收缩侧滑
    var level = e.currentTarget.dataset.level;
    this.setData({
      switch_level_on: "",
      level: level
    });
  },
  onClickGearbox: function (e) {
    //变速箱展开侧滑
    if (objPage.data.gearbox && objPage.data.gearbox != '请选择') {
      this.setData({
        switch_speed_on: "",
      });
    } else {
      this.setData({
        switch_speed_on: "on",
      });
    }
  },
  onClickGearboxSub: function (e) {
    //变速箱收缩侧滑
    var gearbox = e.currentTarget.dataset.gearbox;
    this.setData({
      switch_speed_on: "",
      gearbox: gearbox
    });
  },
  onClickCityshow: function (e) {
    //车牌地区选择
    var licenseAreaList = [
      '京', '沪', '津', '渝', '浙', '苏', '粤', '鄂', '晋', '冀', '豫', '川', '辽', '吉', '黑', '皖', '鲁', '湘', '赣', '闽', '陕', '甘', '宁', '蒙', '贵',
      '云', '桂', '琼', '青', '新', '藏', '港', '澳'
    ];
    this.setData({
      switch_cityshow: "city_show",
      areaList: licenseAreaList
    });
  },
  onClickCityhide: function (e) {
    var license_area = e.currentTarget.dataset.license_area;
    this.setData({
      switch_cityshow: "",
      license_area: license_area
    });
  },
  onClickPic: function (e) {
    //车主实拍照片换封面
    var selectnum = e.currentTarget.dataset.selectnum;
    var selectsrc = e.currentTarget.dataset.selectsrc;
    this.setData({
      switch_cover_show: "show",
      selectnum: selectnum,
      gallarySrc: selectsrc
    });
  },
  onClickCover: function (e) {
    //设置封面
    this.setData({
      switch_cover_show: ""
    });
    var selectnum = e.currentTarget.dataset.select;
    var coverName = '';
    switch (selectnum) {
      case 'select1':
        // if (objPage.data.carInfo.image[0].name) {
        //   coverName = objPage.data.carInfo.image[0].name;
        // } else {
        //   coverName = imgList.image1.filename;
        // }
        coverName = imgList.image1.filename;
        objPage.setData({
          select1: "select",
          select2: "",
          select3: "",
          select4: "",
          select5: "",
          cover: coverName
        })
        break;
      case 'select2':
        coverName = imgList.image2.filename;
        objPage.setData({
          select1: "",
          select2: "select",
          select3: "",
          select4: "",
          select5: "",
          cover: coverName
        })
        break;
      case 'select3':
        coverName = imgList.image3.filename;
        objPage.setData({
          select1: "",
          select2: "",
          select3: "select",
          select4: "",
          select5: "",
          cover: coverName
        })
        break;
      case 'select4':
        coverName = imgList.image4.filename;
        objPage.setData({
          select1: "",
          select2: "",
          select3: "",
          select4: "select",
          select5: "",
          cover: coverName
        })
        break;
      case 'select5':
        coverName = imgList.image5.filename;
        objPage.setData({
          select1: "",
          select2: "",
          select3: "",
          select4: "",
          select5: "select",
          cover: coverName
        })
        break;
    }

    //设为封面后的封面图片处理
    var selCov = selectnum.substring(selectnum.length - 1);
    for (var i in imgList) {
      var r = imgList[i];
      var index = i.substring(i.length - 1)
      if (index == selCov) {
        imgList[i].original = r.filename;
      } else {
        imgList[i].original = '';
      }
    }
  },
  // 查看大图
  onClickBig: function (e) {
    this.setData({
      switch_cover_show: "",
      gallaryOn:"on"
    });
  },
  onClickDelete: function (e) {
    var selectnum = e.currentTarget.dataset.select;
    var imgName = e.currentTarget.dataset.img_name;
    if (imgName == objPage.data.cover) {
      objPage.setData({ cover: '' });
    }
    switch (selectnum) {
      case 'select1':
        this.setData({
          image1: "",
          on1: ""
        })
        break;
      case 'select2':
        this.setData({
          image2: "",
          on2: ""
        })
        break;
      case 'select3':
        this.setData({
          image3: "",
          on3: ""
        })
        break;
      case 'select4':
        this.setData({
          image4: "",
          on4: ""
        })
        break;
      case 'select5':
        this.setData({
          image5: "",
          on5: ""
        })
        break;
      case 'license':
        var licenseName = imgName.lastIndexOf('/');
        imgName = imgName.substring(licenseName + 1);
        this.setData({
          license: "",
          on6: ""
        })
        break;
      case 'license1':
        var licenseName = imgName.lastIndexOf('/');
        imgName = imgName.substring(licenseName + 1);
        this.setData({
          license: "",
          on6: ""
        })
        break;
      case 'license2':
        var licenseName = imgName.lastIndexOf('/');
        imgName = imgName.substring(licenseName + 1);
        this.setData({
          license: "",
          on6: ""
        })
        break;
    }
    var imgs = '';
    if (this.data.img_delete) {
      imgs = this.data.img_delete + ',' + imgName;
    } else {
      imgs = imgName;
    }
    this.setData({
      img_delete: imgs
    });
  },
  mobileBlur: function (e) {
    //设置输入的手机号
    var phone = e.detail.value;
    mobile = phone;
    this.setData({ phone_num: phone})
  },
  onClickaddBrand: function (e) {
    //添加自定义品牌
    this.setData({ addbrand: e.detail.value })
  },
  onClickaddSerie: function (e) {
    //添加自定义车系
    this.setData({ addserie: e.detail.value })
  },
  onClickaddModel: function (e) {
    //添加自定义车型
    this.setData({ addmodel: e.detail.value })
  },
  onSendVerify: function (opt) {
    //发送验证码
    var sendtype = opt.currentTarget.dataset.sendtype;
    var username = this.data.phone_num ? this.data.phone_num : mobile;
    sendVerify(username, sendtype);
  },
  bindPickerChange: function (e) {
    //车牌所在地
    var id = e.detail.value;
    var listProvince = objPage.data.list_provinces;       //省列表
    var regionType = e.currentTarget.dataset.region_type;
    var provinceId = listProvince[id].id;                 //省ID
    if (regionType == 'province') {
      var listCity = common.getCitys(provinceId);         //当前市列表
      objPage.setData({
        index_province: id,
        index_province_id: listProvince[id].id,
        index_province_name: listProvince[id].name,       //省名称
        list_citys: listCity,
        index_city: 0,
        index_city_id: listCity[0].id,
        index_city_name: listCity[0].name
      });
    }
    if (regionType == 'city') {
      var listCity = objPage.data.list_citys; //当前市列表
      var cityId = id;
      var cityName = listCity[id].name;
      objPage.setData({
        index_city: id,
        index_city_id: listCity[id].id,
        index_city_name: cityName
      });
    }
  },
  datePickerChange: function (e) {
    dateInfo = e.detail.value;
    var dataType = e.currentTarget.dataset.type;
    switch (dataType) {
      case 'first_on_card':          //首次上牌时间
        this.setData({
          first_on_card: dateInfo
        })
        break;
      case 'inspection_date':        //年检有效期
        this.setData({
          inspection_date: dateInfo
        })
        break;
      case 'sali_date':              //交强险到期
        this.setData({
          sali_date: dateInfo
        })
        break;
      case 'insurance_date':         //商业保险到期
        this.setData({
          insurance_date: dateInfo
        })
        break;
      case 'warranty_date':          //质保有效期
        this.setData({
          warranty_date: dateInfo
        })
        break;
    }
  },
  onClickUpload: function (e) {
    if (this.data.switch_upload_on == 'on') {
      this.setData({
        switch_upload_on: "",
        show_text: "上传证件照，提升信息完整度"
      });
    } else {
      this.setData({
        switch_upload_on: "on",
        show_text: "收起证件照"
      });
    }
  },
  showSelfSay: function (e) {
    this.setData({
      switch_self_on: "on"
    });
  },
  // 车主自述
  onInputClick: function (e) {
    var length = e.detail.value.length;
    this.setData({
      input_length: length,
      teach_text: e.detail.value
    });
  },
  // 教我怎么写
  onClickTeach: function (e) {
    var length = e.currentTarget.dataset.edit.length;
    var text = e.currentTarget.dataset.edit;
    this.setData({
      input_length: length,
      teach_text: text
    });
  },
  onClickClear: function (e) {
    this.setData({
      input_length: '0',
      teach_text: ''
    });
  },
  onTeachConfirm: function (e) {
    var text = e.currentTarget.dataset.text;
    this.setData({
      owners_text: text,
      switch_self_on: ''
    });
  },
  onTeachCancle: function (e) {
    this.setData({
      switch_self_on: ''
    });
  },
  onClickImage: function (e) {
    var imgName = e.currentTarget.dataset.image;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths;
        switch (imgName) {
          case 'image1':
            objPage.setData({
              image1: res.tempFilePaths,
              on1: 'on'
            })
            break;
          case 'image2':
            objPage.setData({
              image2: res.tempFilePaths,
              on2: 'on'
            })
            break;
          case 'image3':
            objPage.setData({
              image3: res.tempFilePaths,
              on3: 'on'
            })
            break;
          case 'image4':
            objPage.setData({
              image4: res.tempFilePaths,
              on4: 'on'
            })
            break;
          case 'image5':
            objPage.setData({
              image5: res.tempFilePaths,
              on5: 'on'
            })
            break;
          case 'license':
            objPage.setData({
              license: res.tempFilePaths,
              on6: 'on'
            })
            break;
          case 'license1':
            objPage.setData({
              license1: res.tempFilePaths,
              on7: 'on'
            })
            break;
          case 'license2':
            objPage.setData({
              license2: res.tempFilePaths,
              on8: 'on'
            })
            break;
        }

        //上传图片到服务器
        var coverDef = '';
        var covershow = objPage.data.cover;
        if (covershow === '') {
          coverDef = 'cover';
        }

        wx.uploadFile({
          url: CFG.USERDCAR_APP_API_HOST + 'SellCar/UploadCarImages', //仅为示例，非真实的接口地址
          filePath: tempFilePaths[0],
          name: imgName,
          formData: {
            name: coverDef
          },
          success: function (res) {
            var data = res.data;
            var imgObj = JSON.parse(data);
            var filename = imgObj.filename;
            var imgKey = imgObj.key;
            var cover = objPage.data.cover;
            if (cover === '') {
              objPage.setData({
                cover: filename
              });
              if (imgKey == 'image1') {
                objPage.setData({
                  select1: 'select'
                });
              } else if (imgKey == 'image2') {
                objPage.setData({
                  select2: 'select'
                });
              }
              else if (imgKey == 'image3') {
                objPage.setData({
                  select3: 'select'
                });
              }
              else if (imgKey == 'image4') {
                objPage.setData({
                  select4: 'select'
                });
              }
              else if (imgKey == 'image5') {
                objPage.setData({
                  select5: 'select'
                });
              }
            }
            imgList[imgName] = imgObj;
          }
        })
      }
    })
  },
  formSubmit: function (e) {
    //提交表单
    formData = e.detail.value;
    subPublish(e.detail.value);
  }
})
