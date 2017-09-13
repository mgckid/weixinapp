var CFG = require('../../../utils/config.js');
var common = require('../../../utils/util.js');

function ajaxLogin(data) {
  // 提交验证
  var url = CFG.APP_API_HOST + 'Account/V2/Authenticate'; 
  common.httpRequest(url,{
    data: data,
    success: function (res) {
      var token = res.data.token;
      var code = res.data.code;
      var msg = res.data.message;
      if (undefined !== token && token) {
         wx.setStorage({key:'token',data:token,success:function(){
             wx.navigateBack();
         }});
         wx.setStorage({key:'login_name',data:data.username});
      } else if (undefined !== code && code >= 200) {
        common.msg(msg);
      } else {
        wx.showModal({content:'未知错误'});
      }
    }
  })
}

Page({
  data: {
    toView: 'red',
    scrollTop: 100,
    focusType:[
      {isfocus:''},
      {isfocus:''}
    ]
  },
  onLoad:function(){
  },
  formSubmit:function(e){
    var opts = e.detail.value;
    var username = opts.username;
    var password = opts.password;

    if ('' === username || '' === password) {
      wx.showModal({
        title: '提示',
        content: '用户或密码不能为空',
        success: function (res) {
          if (res.confirm) {
          }
        }
      });
      return;
    }
    //?captcha=&deviceType=iPhone3x&password=1234567&username=13100663251
    var submit = {};
    submit.username = username;
    submit.password = password;
    submit.deviceType = 'iPhone3x';
    submit.captcha = '';

    ajaxLogin(submit);

  },
  foucsColor:function(e){
    var eid=e.target.dataset.id;
    var that=this;
    var focusType=[];
    for(var i=0;i<that.data.focusType.length;i++){
      focusType.push({});
      focusType[i].isfocus=''
    }
    focusType[eid].isfocus='focus'
    that.setData({focusType:focusType})
  },
  onPullDownRefresh: function (e) {
    wx.stopPullDownRefresh();
  }
})