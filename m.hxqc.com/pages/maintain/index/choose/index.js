// pages/maintain/choose/index.js
var common = require('../../../../utils/util.js')
var CFG = require('../../../../utils/config.js')
var objPage = null;

function getMaintainList(serieID, modelID, distance) {
  var url = CFG.MAINTAIN_APP_API_HOST + 'Maintenance/itemsAllOverviewN';

  common.httpRequest(url, {
    pageLoading: true,
    data: { seriesID: serieID, autoModelID: modelID, drivingDistance: distance },
    success: function (res) {
      var statusCode = res.statusCode;
      var list = res.data;
      var ls_recommand = [],ls_optional = [];
      if (200 == statusCode && undefined !== list.length) {
        for(var i in list){
          for( var j in list[i].items){
            var t = list[i].items[j];
             if(1 == t.choose){
               ls_recommand.push(t)
             }else{
               ls_optional.push(t)
             }
          }
        }

        var ls = [];
        ls.push({groupTag:'推荐的项目',items:ls_recommand});
        ls.push({groupTag:'可自行选择的项目',items:ls_optional});
        objPage.setData({ list: ls });
      } else {
        common.msg('该车型未能匹配到保养手册');
      }
    },
  })
}

function onClickGoods(e) {
  var opt = e.currentTarget.dataset;
  var tagId = opt.tagId;
  var goodsId = opt.goodsId;
  var list = objPage.data.list;
  var choose = list[tagId].items[goodsId].choose;
  var bothGroup = parseInt(list[tagId].items[goodsId].bothGroup);
  // 查找相同bothGroup的tagId-goodsId 集合
  var maps = [];
  {
    if (bothGroup > 0) {
      for (var i in list) {
        for (var j in list[i].items) {
          var group = list[i].items[j].bothGroup;
          if (group == bothGroup && (i + '-' + j) !== (tagId + '-' + goodsId)) {
            maps.push({ tagId: i, goodsId: j });
          }
        }
      }
    }
  }
  // 设置被选中项
  var set_v = '';
  if (choose) {
    set_v = 0;
  } else {
    set_v = 1;
  }
  list[tagId].items[goodsId].choose = set_v;
  // 设置被选中项-bothGroup）
  for (var i in maps) {
    list[maps[i].tagId].items[maps[i].goodsId].choose = set_v;
  }

  objPage.setData({ list: list });
}

function onSubmit(opt) {
  // 获取选中的保养项目:
  var items = { itemGroupID: [], item: [], packages: [] }
  var goods = [];
  {
    var list = objPage.data.list;
    for (var i in list) {
      for (var j in list[i].items) {
        var choose = list[i].items[j].choose;
        var groupID = list[i].items[j].itemGroupID;
        if (1 == choose) {
          goods.push(groupID);
        }
      }
    }
    if (0 == goods.length) {
      common.msg('请选择保养项目');
      return;
    }

    items.itemGroupID = goods;
  }
  // 获取车型缓存：
  var k = 'maintain_repair_default_model_info';
  var default_model = wx.getStorageSync(k);
  if (undefined !== default_model && undefined !== default_model.brandName) {
    objPage.setData({ default_model: default_model });
    var serieID = default_model.serieID;
    var modelID = default_model.modelID;
    var brandID = default_model.brandID;

    var itemJSON = JSON.stringify(items);

    var params = ['brandID=' + brandID, 'serieID=' + serieID, 'modelID=' + modelID , 'itemJSON='+itemJSON , 'distance='+objPage.data.distance];
    url = '/pages/maintain/index/shop/index?' + params.join('&');
    wx.navigateTo({ url: url })
  } else {
    common.msg('请选择车型');
  }
}

Page({
  data: {
    ls_recommand:[],
    ls_optional:[],
    list: [],
    default_model: {},
    popClass: '',
    distance: '',
    serieID:'',
    modelID:''
  },
  onLoad: function (opt) {
    objPage = this;
    // 获取缓存：
    var k = 'maintain_repair_default_model_info';
    var default_model = wx.getStorageSync(k);
    if (undefined !== default_model && undefined !== default_model.brandName) {
      objPage.setData({ default_model: default_model });
      var serieID = default_model.serieID;
      var modelID = default_model.modelID;
      var distance = 10;
      // 获取距离缓存
      {
        var k2 = 'maintain_defalut_model_driving_distance';
        var def_distance = wx.getStorageSync(k2);
        if (!!def_distance) {
          distance = def_distance;
        }
        objPage.setData({ distance: def_distance,serieID:serieID, modelID:modelID});
      }
      getMaintainList(serieID, modelID, distance);
    } else {
      wx.redirectTo({ url: '/pages/maintain/repair/filter?type=maintain' })
    }
  },
  popShow: function () {
    this.setData({ popClass: 'on' })
  },
  popHide: function () {
    this.setData({ popClass: '' })
  },
  onClickGoods: function (e) {
    onClickGoods(e)
  },
  onSubmit: function (e) {
    onSubmit(e);
  },
  onPullDownRefresh: function (e) {
    var serieID = this.data.serieID
    var modelID = this.data.modelID
    var distance = this.data.distance
    getMaintainList(serieID, modelID, distance);
    wx.stopPullDownRefresh();
  }
})

// {"itemGroupID":["xby","dby","44","222","kv"],"item":[],"packages":[]}