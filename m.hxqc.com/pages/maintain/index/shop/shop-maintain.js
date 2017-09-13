// pages/maintain/index/shop/shop-maintain.js
var common = require('../../../../utils/util.js')
var CFG = require('../../../../utils/config.js')
var mapTool = require('../../../../utils/GPS.js');
var objPage = null;

// 初始化店铺信息
function initShopInfo(shopID) {
  var url = CFG.APP_API_HOST + 'Shop/V2/Shop';
  common.httpRequest(url, {
    data: { shopID: shopID },
    success: function (res) {
      var statusCode = res.statusCode;
      var info = res.data;
      if (200 == statusCode && undefined !== info.shopInfo) {
        // 设置店铺title
        wx.setNavigationBarTitle({ title: info.shopInfo.shopTitle })
        objPage.setData({ info: info });
      } else {
        common.msg('店铺数据获取失败');
      }
    },
  })
}

// 获取保养项目
function getMaintainItems() {
  var url = CFG.MAINTAIN_APP_API_HOST + 'Maintenance/itemsFor4S2';
  var opt = objPage.data;
  common.httpRequest(url, {
    data: { shopID: opt.shopID, brandID: opt.brandID, seriesID: opt.serieID, autoModelID: opt.modelID, drivingDistance: opt.distance },
    pageLoading: true,
    success: function (res) {
      var statusCode = res.statusCode;
      var info = res.data;
      if (200 == statusCode && undefined !== info.length) {
        // 分组:推荐组+自行选择组
        var list_recommand = [];
        var list_optional = [];
        var summary = { pay: 0.00, total: 0.00, goods: 0.00, discount: 0.00, workCost: 0.00 };
        for (var i in info) {
          info[i].summary = { pay: 0, total: 0, discount: 0, goods: 0, workCost: 0 };
          // 重新计算价格保养组信息
          {
            for (var j in info[i].items) {
              info[i].summary.discount += parseFloat(info[i].items[j].discount);
              info[i].summary.workCost += parseFloat(info[i].items[j].workCost);
              for (var k in info[i].items[j].goods) {
                for (var h in info[i].items[j].goods[k]) {
                  info[i].items[j].goods[k][h].amount = info[i].items[j].goods[k][h].amount.toFixed(2);
                  if (info[i].items[j].goods[k][h].choose > 0) {
                    info[i].summary.goods += parseFloat(info[i].items[j].goods[k][h].amount); // 有个数
                  }
                }
              }
            }

            info[i].summary.total = (info[i].summary.workCost + info[i].summary.goods).toFixed(2);
            info[i].summary.pay = (info[i].summary.total - info[i].summary.discount).toFixed(2);
          }

          // 判断是否在被选中的保养组中,如果不在则视为可选择保养项目
          if (-1 === objPage.data.itemGroupIDs.indexOf(info[i].itemGroupID)) {
            info[i].choose = 0;

            // 叶子节点修改选中状态
            var item = info[i];
             for(var j in item.items ){
               for(var k in item.items[j].goods){
                   for(var l in item.items[j].goods[k]){
                      item.items[j].goods[k][l].choose = 0;
                    }
                    if(1 == item.items[j].goods[k].length){
                       item.items[j].goods[k][0].choose = 1;
                    }
                }
             }
             info[i] = item;
          }
          if (1 == info[i].choose) {
            list_recommand.push(info[i]);
            summary.workCost += parseFloat(info[i].summary.workCost);
            summary.goods += parseFloat(info[i].summary.goods);
            summary.discount += parseFloat(info[i].summary.discount);
          } else {
            list_optional.push(info[i]);
          }
        }

        // 格式化 Summary
        summary.total = summary.workCost + summary.goods;
        summary.pay = summary.total - summary.discount;

        summary.total = summary.total.toFixed(2);
        summary.goods = summary.goods.toFixed(2);
        summary.workCost = summary.workCost.toFixed(2);
        summary.discount = summary.discount.toFixed(2);
        summary.pay = summary.pay.toFixed(2);

        objPage.setData({ list_recommand: list_recommand, list_optional: list_optional, summary: summary });
      } else {
        common.msg('保养项目数据获取失败');
      }
    },
  })
}

// 导航事件
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

function onClickGoods(e) {
  var objData = objPage.data;
  var opt = e.currentTarget.dataset;
  var ls_rec = objPage.data.list_recommand;
  var ls_opt = objPage.data.list_optional;
  var ia = opt.ia, ib = opt.ib, ic = opt.ic, id = opt.id;
  if('recommand' == opt.type && !objData.list_recommand[ia].choose)
    return;  
  if('optional' == opt.type && !objData.list_optional[ia].choose)
    return;

  var choose = opt.choose;
  // 修改

  switch (opt.type) {
    case 'recommand':
      var ls = ls_rec[ia].items[ib].goods[ic];
      // 
      if (choose) {
        // @todo
      } else {
        for (var i in ls) {
          if (id == i) {
            ls[i].choose = 1;
          } else {
            ls[i].choose = 0;
          }
        }
      }
      ls_rec[ia].items[ib].goods[ic] = ls;
      break;
    case 'optional':
      var ls = ls_opt[ia].items[ib].goods[ic];
      // 
      if (choose) {
        // @todo
      } else {
        for (var i in ls) {
          if (id == i) {
            ls[i].choose = 1;
          } else {
            ls[i].choose = 0;
          }
        }
      }
      ls_opt[ia].items[ib].goods[ic] = ls;
      break;
  }
  objPage.setData({ list_recommand: ls_rec, list_optional: ls_opt });
  flushSummary();
}

function onClickGoodType(e) {
  var opt = e.currentTarget.dataset;
  var ls_rec = objPage.data.list_recommand; // 推荐
  var ls_opt = objPage.data.list_optional; // 自选
  var i = opt.i;
  var groupId = opt.groupid;
  switch (opt.type) {
    case 'recommand':
      var item = ls_rec[i];
      if(0 == item.choose){
        item.choose = 1;
        for(var j in item.items ){
          for(var k in item.items[j].goods){
            if(item.items[j].goods[k].length > 1){
              for(var l in item.items[j].goods[k]){
                item.items[j].goods[k][l].choose = 0;
              }
            }
            item.items[j].goods[k][0].choose = 1;
          }
        }
      }else{
        item.choose = 0;
        for(var j in item.items ){
          for(var k in item.items[j].goods){
             for(var l in item.items[j].goods[k]){
                item.items[j].goods[k][l].choose = 0;
              }
              if(1 == item.items[j].goods[k].length){
                 item.items[j].goods[k][0].choose = 1;
              }
          }
        }
      }

      ls_rec[i] = item;
      objPage.setData({list_recommand:ls_rec});
      break;
    case 'optional':
     var item = ls_opt[i];
      if(0 == item.choose){
        item.choose = 1;
        for(var j in item.items ){
          for(var k in item.items[j].goods){
            if(item.items[j].goods[k].length > 1){
              for(var l in item.items[j].goods[k]){
                item.items[j].goods[k][l].choose = 0;
              }
            }
            item.items[j].goods[k][0].choose = 1;
          }
        }
      }else{
        item.choose = 0;
        for(var j in item.items ){
          for(var k in item.items[j].goods){
              for(var l in item.items[j].goods[k]){
                item.items[j].goods[k][l].choose = 0;
              }
              if(1 == item.items[j].goods[k].length){
                 item.items[j].goods[k][0].choose = 1;
              }
          }
        }
      }
      ls_opt[i] = item;
      objPage.setData({list_optional:ls_opt});
      break;
  }
  flushSummary();
}

// 重新刷新data.summary
function flushSummary() {
  var list_rec = objPage.data.list_recommand; // 推荐
  var list_opt = objPage.data.list_optional; // 自选

  var sets = [list_rec, list_opt];
  var summary = { pay: 0.00, total: 0.00, goods: 0.00, discount: 0.00, workCost: 0.00 };

  for (var x in sets) {
    var tmp = sets[x];
    for (var i in tmp) {
      tmp[i].summary = { pay: 0, total: 0, discount: 0, goods: 0, workCost: 0 };
      // 重新计算价格保养组信息
      {
        for (var j in tmp[i].items) {
          tmp[i].summary.discount += parseFloat(tmp[i].items[j].discount);
          tmp[i].summary.workCost += parseFloat(tmp[i].items[j].workCost);
          for (var k in tmp[i].items[j].goods) {
            for (var h in tmp[i].items[j].goods[k]) {
              // tmp[i].items[j].goods[k][h].amount = tmp[i].items[j].goods[k][h].amount.toFixed(2);
              if (tmp[i].items[j].goods[k][h].choose) {
                tmp[i].summary.goods += parseFloat(tmp[i].items[j].goods[k][h].amount); // 有个数
              }
            }
          }
        }

        // 单项小计
        tmp[i].summary.total = (tmp[i].summary.workCost + tmp[i].summary.goods).toFixed(2);
        tmp[i].summary.pay = (tmp[i].summary.total - tmp[i].summary.discount).toFixed(2);

        if (1 == tmp[i].choose) {
          summary.workCost += parseFloat(tmp[i].summary.workCost);
          summary.goods += parseFloat(tmp[i].summary.goods);
          summary.discount += parseFloat(tmp[i].summary.discount);
        }
      }
    }
    sets[x] = tmp;
  }

  // 格式化 Summary
  summary.total = summary.workCost + summary.goods;
  summary.pay = summary.total - summary.discount;

  summary.total = summary.total.toFixed(2);
  summary.goods = summary.goods.toFixed(2);
  summary.workCost = summary.workCost.toFixed(2);
  summary.discount = summary.discount.toFixed(2);
  summary.pay = summary.pay.toFixed(2);

  objPage.setData({ summary: summary , list_recommand:sets['0'],list_optional:sets['1']});
}

function onClickMaintain(e) {
  var pdata = objPage.data;
  var token = wx.getStorageSync('token');

  // 整合保养项目:
  var items = [];
  var ls = [objPage.data.list_recommand, objPage.data.list_optional];
  for (var i in ls) {
    for (var j in ls[i]) {
      var t = ls[i][j];
      if (t.choose) {
        var p = {};
        p.itemGroupID = t.itemGroupID;
        p.item = [];
        for (var k in t.items) {
          var q = {};
          q.itemID = t.items[k].itemID;
          q.goodsID = [];
          for (var h in t.items[k].goods) {
            var r = t.items[k].goods[h];
            for (j in r) {
              if (r[j].choose > 0) {
                var gID = r[j].goodsID + '_' + r[j].count
                q.goodsID.push(gID);
              }
            }
          }
          q.goodsID.length ? p.item.push(q) : null;
        }
        p.item.length ? items.push(p) : null;
      }
    }
  }
  if (0 == items.length) {
    common.msg('请选择保养项目');
    return
  }

  var itemsJSON = JSON.stringify(items);
  // 检验是否登录:
  common.checkToken({
    success: function (e) {
      var u = 'Maintenance/prepareN2';
      var post = { token: token, shopType: 10, shopID: pdata.shopID, seriesID: pdata.serieID, items: itemsJSON, brandID: pdata.brandID, autoModelID: pdata.modelID }
      var query = common.http_build_query(post);
      var u = '/pages/maintain/index/shop/shop-order?' + query
      wx.redirectTo({ url: u })
    }
  });
}

Page({
  data: {
    shopID: '',
    brandID: '',
    serieID: '',
    modelID: '',
    distance: '',
    info: {},
    choose_show:'on',
    itemGroupIDs: [],
    list_recommand: [],
    list_optional: [],
    summary: {
      pay: 0.00,
      total: 0.00,
      goods: 0.00,
      discount: 0.00,
      workCost: 0.00
    }
  },
  onLoad: function (opt) {
    objPage = this;
    var sets = {};
    sets.shopID = opt.shopID;
    sets.brandID = opt.brandID;
    sets.serieID = opt.serieID;
    sets.modelID = opt.modelID;
    sets.distance = opt.distance;
    sets.itemGroupIDs = JSON.parse(opt.itemsJSON).itemGroupID;

    objPage.setData(sets);

    // 初始化店铺信息
    initShopInfo(sets.shopID);

    // 获取订单详情
    getMaintainItems();
  },
  onNav: function (e) {
    onNav(e);
  },
  onClickGoods: function (e) {
    onClickGoods(e);
  },
  onClickGoodType: function (e) {
    onClickGoodType(e);
  },
  onClickMaintain: function (e) {
    onClickMaintain(e);
  },
  choose_show:function(){
    if(this.data.choose_show === ''){
      this.setData({choose_show:'on'})
    }else{
      this.setData({choose_show:''})
    }
  },
  onPullDownRefresh: function (e) {
    wx.stopPullDownRefresh();
  }
})