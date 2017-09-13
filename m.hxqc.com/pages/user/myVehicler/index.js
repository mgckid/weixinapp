var CFG = require('../../../utils/config.js');
var common = require('../../../utils/util.js')
//显示登录弹出信息
function alertLogin() {
  wx.showModal({
    title: '提示',
    content: '登录已过期，请从新登录',
    confirmText:'登录',
    success: function (res) {
        wx.navigateTo({url: '/pages/user/login/index'})
    }
  });
}

//检测是否登录
function checkLogin(that) {
  wx.getStorage({
    key: 'token', success: function (e) {
      that.setData({token:e.data});
      ajaxGetMyVehiclerList(that);
    }, fail: function (res) {
      alertLogin();
    }
  });
}

//ajax获取我的车辆列表
function ajaxGetMyVehiclerList(){
  var that = objPage;
   if (that.data.newsEnd) {
        return;
  }

  var token = wx.getStorageSync('token')
  var pData = that.data;
  var url = CFG.APP_API_HOST + 'Account/V2/MyAuto/index';

  var tick = that.data.newsIndex + 1;
  that.setData({ newsIndex: tick });

  common.httpRequest(url, {
    data: {token:token,count:10,page:tick},
    pageLoading:true,
    success: function (res) {
      var data = res.data;
      var cache = pData.vehiclerList;
      if (!!data.length) {
        data.map(function(n){
          n.statusClass='';
          n.statusText='编辑';
          if(n.expirationOfPolicy){

            n.expirationOfPolicy = n.expirationOfPolicy.replace(/-/g,'.');
          }
          if(n.guaranteePeriod){
            n.guaranteePeriod = n.guaranteePeriod.replace(/-/g,'.');
          }
          if(n.nextMaintenanceDate){
          n.nextMaintenanceDate = n.nextMaintenanceDate.substring(0,7).replace(/-/g,'.');
          }

          cache.push(n);
        })

        that.setData({ vehiclerList: cache });
      }else{
        that.setData({ newsEnd: true });
      }
    }
  })
}


//ajax删除车辆信息
function ajaxDelVehicler(that){
  var url = CFG.APP_API_HOST + 'Account/V2/MyAuto/index';
  var postData = common.http_build_query({token:that.data.token,myAutoID:that.data.myAutoID});
  common.httpRequest(url, {
    pageLoading:true,
    data: postData,
    method: 'DELETE',
    header: {'content-type': 'application/x-www-form-urlencoded'},
    success: function (res) {
      if(res.statusCode === 204){
          ajaxGetMyVehiclerList(that);
          that.popHide();
      }else{
          wx.showToast({
            title: '删除车辆信息失败!',
            duration: 2000
          })
      }
    },
    fail: function (res) {
      // fail
      wx.showToast({
            title: '服务器连接失败!',
            duration: 2000
      })
    }
  })
}

Page({
  data: {
    token:'',
    statusClass:'',
    statusText:'编辑',
    maskClass:'',
    popClass:'',
    myAutoID:'',
    vehiclerList:[],
    newsEnd: false,
    newsIndex: 0
  },
  onLoad:function(opt){
    objPage = this;
  },
  onShow:function(){
    // 页面显示
    checkLogin(this);
  },
  statusEdit:function(e){
    var that = this;
    var xid=e.target.dataset.xid;
    var vehiclerList=this.data.vehiclerList;
    if(vehiclerList[xid].statusClass==='on'){
      vehiclerList[xid].statusClass='';
      vehiclerList[xid].statusText='编辑';
    }else{
      vehiclerList[xid].statusClass='on';
      vehiclerList[xid].statusText='完成';
    }
    that.setData({vehiclerList:vehiclerList});
  },
  popShow:function(e){
    this.setData({maskClass:'on',popClass:'on',myAutoID:e.target.dataset.sn});
  },
  popHide:function(){
    this.setData({maskClass:'',popClass:''})
  },
  onDelVehicler:function(){
    ajaxDelVehicler(this);
  },
  onClickWait: function () {
    common.msg('敬请期待 :)');
  },
  onWaterFall:function(){
    ajaxGetMyVehiclerList()
  },
  onPullDownRefresh: function (e) {
    wx.stopPullDownRefresh();
  }
})