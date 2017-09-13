var userNavList=[
  {img:'http://m.hxqc.com/wxapp/index/vip_orders/home-main01.png',url:'/User/Order/index.html',text:'我的订单'},
  {img:'http://m.hxqc.com/wxapp/index/vip_orders/home-main07.png',url:'/User/MyVehicler/index.html',text:'车辆信息'},
  {img:'http://m.hxqc.com/wxapp/index/vip_orders/home-main08.png',url:'/User/Order/index.html',text:'会员手册'},
  {img:'http://m.hxqc.com/wxapp/index/vip_orders/home-main02.png',url:'/User/Order/index.html',text:'在线客服'},
  {img:'http://m.hxqc.com/wxapp/index/vip_orders/home-main02.png',url:'/User/Order/index.html',text:'我的钱包'},
  {img:'http://m.hxqc.com/wxapp/index/vip_orders/home-main17.png',url:'/User/Order/index.html',text:'我的二手车'},
  {img:'http://m.hxqc.com/wxapp/index/vip_orders/home-main19.png',url:'/User/Order/index.html',text:'客户投诉'},
  {img:'http://m.hxqc.com/wxapp/index/vip_orders/home-main11.png',url:'/User/Order/index.html',text:'我的评价'},
  {img:'http://m.hxqc.com/wxapp/index/vip_orders/home-main03.png',url:'/User/Order/index.html',text:'购物车'}
]
Page({
  data: {
    toView: 'red',
    scrollTop: 100,
    userNavList:userNavList,
    imgData:'http://s.t.hxqc.com/newcar/frontend_upload/user/1c/fb/1cfb5513b17aedc2fc4ab8c0ae9a7582_100_100.jpg',
    resPathList:''
  },
  onLoad:function(){
    var that=this;
    wx.getStorage({key:'username',fail:function(res){
      wx.redirectTo({
        url:'../login/index'
      })
    }});
  },
  uploadfile:function(){
    var that=this;
    wx.chooseImage({
      count: 1, // 默认9
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        that.setData({imgData:tempFilePaths[0]})
      }
    })
  },
  onPullDownRefresh: function (e) {
    wx.stopPullDownRefresh();
  }
})