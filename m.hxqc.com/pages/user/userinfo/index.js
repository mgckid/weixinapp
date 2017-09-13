var CFG = require('../../../utils/config.js');
var common = require('../../../utils/util.js');
var citySlider = require('../../../utils/citySlider/index.js');
var objPage = null;


function alertLogin() {
	wx.showModal({
		title: '提示',
		content: '登录已过期，请从新登录',
		confirmText: '登录',
		success: function (res) {
			if (res.confirm) {
				wx.navigateTo({ url: '/pages/user/login/index' })
			}
		}
	});
}


function checkLogin(that) {
	wx.getStorage({
		key: 'token',
		success: function (e) {
			var req = {};
			req.token = e.data;
			ajaxGetUserInfo(req, that);
		},
		fail: function (res) {
			alertLogin();
		}
	});
}

function ajaxGetUserInfo(data, page) {
	// 提交验证
	var url = CFG.APP_API_HOST + 'Account/V2/Users';
	common.httpRequest(url, {
		data: data,
		pageLoading: true,
		success: function (res) {
			var userInfo = res.data;
			var tel = res.data.phoneNumber;
			var avatar = res.data.avatar;
			var nickName = res.data.nickName;
			var code = res.data.code;
			var msg = res.data.message;

			if (undefined !== tel && tel) {
				var info = {};
				info.avatar = avatar ? avatar : CFG.DEFAULT_AVATAR;
				info.nickName = nickName;
				info.name = userInfo.fullname;
				info.sex = userInfo.gender;
				info.birthday = userInfo.birthday;
				info.area = userInfo.province + userInfo.city
					+ userInfo.district;
				info.addr = userInfo.detailedAddress;
				if(!!info.birthday){
					objPage.setData({placeholder_birth:''})
				}
				page.setData({
					userInfo: info
				});

				// 初始化省市侧滑选择控件
				citySlider.init(objPage);
				objPage.setCurrentCity(userInfo.province,userInfo.city,userInfo.district);

			} else if (undefined !== code && code >= 200) {
				clearToken()
			} else {
				common.msg('未知错误');
			}

		}
	})
}

function updateInfo(data) {
	// 获取token登录
	wx.getStorage({
		key: 'token',
		success: function (e) {
			data.token = e.data;

			// 提交验证
			common.showLoading('保存中')
			var url = CFG.APP_API_HOST + '/Account/V2/Users';
			common.httpRequest(url, {
				method: 'PUT',
				data: data,
				success: function (res) {
					var code = res.data.code;
					var msg = res.data.message;
					if (200 == res.statusCode) {
						if (undefined === code) {
							wx.navigateBack();
						} else {
							common.msg(msg);
						}
					} else {
						common.msg(msg);
					}
				}
			})
		},
		fail: function (res) {
			alertLogin();
		}
	});
}

Page({
	data: {
		userInfo: {
			avatar: '',
			nickName: '',
			name: '',
			sex: '',
			birthday: '',
			area: '',
			addr: ''
		},
		placeholder_birth:'请选择出生日期',
		datepicker_end:common.formatDate( new Date().toLocaleString(),'yyyy-MM-dd'),
		index: 0,
		showCounty:true,
		toView: 'red',
		scrollTop: 100
	},
	onPullDownRefresh: function (e) {
    	wx.stopPullDownRefresh();
  	},
	onLoad: function () {
		objPage = this;
		checkLogin(this);
	},
	bindPickerChange: function (e) {
		this.setData({
			index: e.detail.value
		})
	},
	bindDateChange: function (e) {
		var userInfo = this.data.userInfo;
		userInfo.birthday = e.detail.value;
		this.setData({ userInfo: userInfo,placeholder_birth:'' });
	},
	formSubmit: function (e) {
		var userInfo = this.data.userInfo;
		var ins = e.detail.value;
		var post = {};
		post.birthDay = userInfo.birthday;
		post.detailedAddress = ins.addr
		post.fullname = ins.name;
		post.nickName = ins.nickName;
		post.gender = ins.gender

		const cityInfo = this.getCurrentCity();

		post.province = cityInfo.provinceName;
		post.provinceID = cityInfo.provinceID;
		post.city = cityInfo.cityName;
		post.cityID = cityInfo.cityID;
		post.district = cityInfo.countyName;
		post.distriID = cityInfo.countyID;

		post.birthDay = userInfo.birthday

		// 表单验证
		if(!common.validReg('username',post.nickName)){
			return;
		}
		if(!common.validReg('realname',post.fullname)){
			return;
		}
		updateInfo(post);
	},
	updateAvatar: function (e) {
		var that = this;
		wx.getStorage({
			key: 'token',
			success: function (e) {
				var data = {};
				data.deviceType = CFG.DEVICE_TYPE;
				data.token = e.data;
				data = common.makeFormData(data); // 解决预上线和线上form表单加密问题
				wx.chooseImage({
					success: function (res) {
						var tempFilePaths = res.tempFilePaths;
						wx.showToast({
							title: '上传中',
							icon: 'loading',
							duration: 10000
						});
						wx.uploadFile({
							url: CFG.APP_API_HOST + 'Account/V2/Users/avatar',
							filePath: tempFilePaths[0],
							name: 'avatar',
							formData: data,
							success: function (res) {
								wx.hideToast();
								if (res.statusCode >= 200) {
									var data = JSON.parse(res.data);
									if (undefined !== data && undefined !== data.url && data.url) {
										var newAvatar = data.url;
										var userInfo = that.data.userInfo;
										userInfo.avatar = newAvatar;
										that.setData({ userInfo: userInfo });
										return;
									}
								}
								common.msg('未知错误');
							},
							fail: function (e) {
								wx.hideToast()
								common.msg('网络错误');
							}
						})
					}
				})
			},
			fail: function () {
				alertLogin();
			}
		});
	}
})
