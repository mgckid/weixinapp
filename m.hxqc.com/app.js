var CFG = require('/utils/config.js');
var common = require('/utils/util.js');

function getOpenID(code){
  var u = CFG.APP_API_HOST + '/Mall/Wechat/Wx/getWeChatAPPOpenID';
  var query = {code:code};
    common.httpRequest(u, {
    data: query,
    success: function (res) {
      var statusCode = res.statusCode;
      var info = res.data;
      if(200 === statusCode && !!info.openid){
         wx.setStorage({key:"openid", data:info.openid })
      }else{
         common.msg('OpenID获取失败');
      }
    }
  });
}
App({
  onLaunch: function () {
    common.cacheCitys();// 缓存城市

    var openid =  wx.getStorageSync('openid') // 缓存openid
    if(!openid){
      wx.login({
        success: function (res) {
          var code = res.code;
          getOpenID(code);
        }
      })
    }
  },
  globalData: {
    visits: 1,
    deviceType: ''
  },
  onPullDownRefresh:function(){
    wx.stopPullDownRefresh()
  },
  onError: function (e) {
    console.log('APPError:');
    console.log(e);
  }
})