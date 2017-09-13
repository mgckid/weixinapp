// pages/maintain/repair/orderform.js
var common = require('../../../utils/util.js')
var CFG = require('../../../utils/config.js')
var mapTool = require('../../../utils/GPS.js');
var token = '';
var mobile = '';
var objPage = null;

// 初始化店铺信息
function initShopInfo(shopID) {
  var url = CFG.APP_API_HOST + 'Shop/V2/Shop';
  common.httpRequest(url, {
    data: { shopID: shopID },
    pageLoading: true,
    success: function (res) {
      var statusCode = res.statusCode;
      var info = res.data;
      if (200 == statusCode && undefined !== info.shopInfo) {
        // 设置店铺title
        wx.setNavigationBarTitle({ title: info.shopInfo.shopTitle })
        objPage.setData({ info: info });
      } else {
        common.msg('数据请求失败');
      }
    },
  })
}

function onNav(e) {
  var lat = e.currentTarget.dataset.lat;
  var lng = e.currentTarget.dataset.lng;
  var loc = mapTool.GPS.bd_decrypt(lat, lng);
  lat = loc.lat;
  lng = loc.lon;

  wx.openLocation({
    latitude: lat,
    longitude: lng,
    scale: 14
  })
}

//维修服务类型数据获取
function serviceTypeList() {
  var url = CFG.MAINTAIN_APP_API_HOST + 'MaintenanceWiki';
  var shopId = objPage.data.info.shopInfo.shopID;
  common.httpRequest(url, {
    data: { shopID: shopId },
    pageLoading: true,
    success: function (res) {
      var statusCode = res.statusCode;
      var info = res.data;
      if (200 == statusCode && undefined !== info.length) {
        objPage.setData({serviceTypeList: info});
      } else {
        common.msg('数据请求失败');
      }
    },
  })
};

//获取用户登陆信息
function login_info(token) {
  var url = CFG.APP_API_HOST + 'Account/V2/Users';
  common.httpRequest(url, {
    data: {token:token},
    success: function (res) {
      var statusCode = res.statusCode;
      var login_info = res.data;
      if (statusCode == 200) {
        login_info.avatar = login_info.avatar ? login_info.avatar : CFG.DEFAULT_AVATAR;
        objPage.setData({loginInfo: login_info});
      } else {
        alertLogin();
      }
    }
  })
}

function alertLogin() {
	wx.showModal({
		title: '提示',
		content: '会话已过期，请重新登录',
		confirmText: '登录',
    // showCancel:false,
		success: function (res) {
			if (res.confirm) {
				wx.navigateTo({ url: '/pages/user/login/index' })
			}
		}
	});
}

//修车预约表单提交
function subCarRepair(data) {
    var name = data.name;
    var phone = data.phone;
    var licence_area =objPage.data.current_city;
    var licence_number = data.licence_number;
    var plateNumber = licence_area + licence_number;
    var serviceType = objPage.data.serviceType;
    if(licence_number == '') {
      common.msg('请输入车牌号');
      return;
    }

    //车牌号验证
    var chk_licence = common.validReg('licensenumber', plateNumber);
    if (!chk_licence) {
      return false;
    }

    //联系人验证
    var chk_name = common.validReg('username', name);
    if (!chk_name) {
      return false;
    }

    //手机号验证
    var chk_phone = common.validReg('mobile', phone);
    if (!chk_phone) {
      return false;
    }

    if(serviceType == '') {
      common.msg('服务类型不能为空');
      return
    }
    var date = objPage.data.date;
    if(date == null) {
      common.msg('请选择预约时间');
      return
    }
    
    var url = CFG.MAINTAIN_APP_API_HOST + 'ReservationMaintain/created';
    var post = {
        name: name, 
        phone: phone, 
        plateNumber: plateNumber, 
        autoModel: objPage.data.autoModel,
        autoModelName: objPage.data.autoModelName,
        serviceType: serviceType,
        kindTitle: objPage.data.serviceTypeName,
        remark: '',
        shopID: objPage.data.info.shopInfo.shopID,
        shopName: objPage.data.info.shopInfo.shopTitle,
        shopType: objPage.data.info.shopInfo.shopType,
        token: token,
        apppintmentDate: date + ' 08:00'
      };
    common.httpRequest(
      url,{
      data:post ,
      method: 'POST',
      success: function (res) {
        var statusCode = res.statusCode;
        var info = res.data;
        if (200 == statusCode && undefined !== info.code && 1 == info.code) {
          common.msg('我们的工作人员会尽快与您取得联系!','预约成功',function(){
            common.goTo('ORDER_LIST');
          });
        } else if(400 === statusCode) {
          common.msg(info.message);
        }else{
          common.msg('预约失败，请重试!');
        }
        objPage.setData({ switch_show: '' })
      }
    })
}


Page({
  data: {
    current_city: '鄂',
    shopID: '',
    info: {},
    city_show: '',
    service_show: '',
    autoModel: '',
    autoModelName:'',
    serviceType: '',
    serviceTypeName: '',
    serviceTypeList: {},
    date: null,
    cityList:[
      {abbr:'京',statusClass:''},{abbr:'沪',statusClass:''},{abbr:'津',statusClass:''},{abbr:'渝',statusClass:''},{abbr:'浙',statusClass:''},{abbr:'苏',statusClass:''},{abbr:'粤',statusClass:''},{abbr:'鄂',statusClass:''},
      {abbr:'晋',statusClass:''},{abbr:'冀',statusClass:''},{abbr:'豫',statusClass:''},{abbr:'川',statusClass:''},{abbr:'辽',statusClass:''},{abbr:'吉',statusClass:''},{abbr:'黑',statusClass:''},{abbr:'皖',statusClass:''},
      {abbr:'鲁',statusClass:''},{abbr:'湘',statusClass:''},{abbr:'赣',statusClass:''},{abbr:'闽',statusClass:''},{abbr:'陕',statusClass:''},{abbr:'甘',statusClass:''},{abbr:'宁',statusClass:''},{abbr:'蒙',statusClass:''},
      {abbr:'贵',statusClass:''},{abbr:'云',statusClass:''},{abbr:'桂',statusClass:''},{abbr:'琼',statusClass:''},{abbr:'新',statusClass:''},{abbr:'藏',statusClass:''},{abbr:'港',statusClass:''},{abbr:'澳',statusClass:''}
    ],
    statusClass:'',
  },
  onLoad: function (opt) {
    objPage = this;
    if (!!opt.shopID) {
      this.setData({ shopID: opt.shopID, autoModel: opt.autoModel, autoModelName: opt.autoModelName});
      initShopInfo(opt.shopID)
    } else {
      common.msg('店铺ID不能为空');
    }
  }, 
  onShow:function(){
    token = wx.getStorageSync('token');
    login_info(token);
  },
  carmask_show: function () {
    this.setData({ city_show: 'city_show' });
  },
  carmask_hide: function () {
    this.setData({ city_show: '' });
  },
  service_show: function () {
    //维修服务类型数据获取
    serviceTypeList();

    this.setData({ service_show: 'on' });
  },
  service_hide: function () {
    this.setData({ service_show: '' });
  },
  onNav: function (e) {
    onNav(e);
  },
  onClickCity: function (e) {
    var opt = e.currentTarget.dataset;
    var city = opt.text;
    objPage.setData({current_city:city});
    //addClass removeClass
    var cityList = this.data.cityList;
    var index = opt.index;
    // 先removeclass
    cityList.map(function(item){
      item.statusClass = '';
    })

    if(cityList[index].statusClass === ''){
      cityList[index].statusClass = 'on';
    }
    this.setData({cityList:cityList});
  },
  onSubmit: function(e) {
    //维修表单预约提交
    subCarRepair(e.detail.value);
  },
  onServiceType: function(e) {
    var typeId = e.currentTarget.dataset.type;
    var typeName = e.currentTarget.dataset.type_name;
    this.setData({
      serviceType: typeId,
      serviceTypeName: typeName
    })
  },
  datePickerChange: function(e) {
    this.setData({
      date: e.detail.value
    })
  },
  onPullDownRefresh: function (e) {
    wx.stopPullDownRefresh();
  },
  checkPlateNumber:function(e){

    var value = e.detail.value.toUpperCase();
    return {
      value: value.replace(/^[^a-zA-Z][^a-zA-Z0-9]*/g,"") //第一个必须是字母第二个可以是数字或字母
    }
  }
})