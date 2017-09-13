var CFG = require('../utils/config.js');
var DES3 = require('../utils/DES3.js');

function get_unix_time(dateStr) {
  var newstr = dateStr.replace(/-/g, '/');
  var date = new Date(newstr);
  var time_str = date.getTime().toString();
  return time_str.substr(0, 10) * 1000;
}

// 返回两个时间相差的天数 tips: date2不传的话默认取当前时间戳
function diffDays(date1,date2){
  date1 = !!date1?date1:'';
  date2 = !!date2?date2:'';
  date1 = date1.replace(/-/g, '/'); // 微信小程序iOS版本不兼容YYYY-mm-dd这种格式构造Date
  date2 = date2.replace(/-/g, '/');

  const d1 = new Date(date1).getTime()
  const d2 = !!date2 ? new Date(date2).getTime() : new Date().getTime()

  const diff = Math.ceil((d1-d2)/(3600*24*1000))
  return diff;
}

// 日期时间比较函数 tips: date2不传的话默认取当前时间戳
function timeCompare(date1,type,date2){
  date1 = !!date1?date1:'';
  date2 = !!date2?date2:'';
  date1 = date1.replace(/-/g, '/');
  date2 = date2.replace(/-/g, '/');
  var stat = null;
  const d1 = new Date(date1).getTime()
  const d2 = !!date2 ? new Date(date2).getTime() : new Date().getTime()
  switch(type){
    case '=' :
      return d1 === d2;
    case '>' : 
      return d1 > d2;
    case '<' :
      return d1 < d2;
    case '>=' :
      return d1 >= d2;
    case '<=':
      return d1 <= d2;
    default:
      console.error('unknown compare type FUNC:timeCompare')
      return null; 
  }
}

function formatDate(dateStr, fmt) {
  var timestamp = get_unix_time(dateStr);
  var date = new Date(timestamp);

  var o = {
    "Y+": date.getFullYear(),
    "M+": date.getMonth() + 1, //月份         
    "d+": date.getDate(), //日         
    "h+": date.getHours() % 12 == 0 ? 12 : date.getHours() % 12, //小时         
    "H+": date.getHours(), //小时         
    "m+": date.getMinutes(), //分         
    "s+": date.getSeconds(), //秒         
    "q+": Math.floor((date.getMonth() + 3) / 3), //季度         
    "S": date.getMilliseconds() //毫秒         
  };
  var week = {
    "0": "/u65e5",
    "1": "/u4e00",
    "2": "/u4e8c",
    "3": "/u4e09",
    "4": "/u56db",
    "5": "/u4e94",
    "6": "/u516d"
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  }
  if (/(E+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "/u661f/u671f" : "/u5468") : "") + week[date.getDay() + ""]);
  }
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    }
  }

  return fmt;
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function objectSort(array) {
  var dicts = Object.keys(array).sort();
  var obj = {};
  for (var i in dicts) {
    obj[dicts[i]] = array[dicts[i]];
  }
  return obj
}

function http_build_query(array,encode) {
  var list = [];
  for (var i in array) {
    // 代码完善：如果值为JSON对象的需要转换为JSON字符串 @Thu Feb 16 10:03:33 CST 2017 by Shaxt
    if ('object' === typeof array[i]) {
      array[i] = JSON.stringify(array[i]);
    }
    var value = encode  ? encodeURIComponent(array[i]):array[i];
    var str = i + '=' + value;
    list.push(str);
  }
  return list.join('&');
}

function msg(msg, title, confirm) {
  confirm = 'function' === typeof confirm ? confirm : function(e) {}; //用户点击确定
  title = title ? title : '提示';
  wx.showModal({
    title: title,
    content: msg,
    showCancel: false,
    success: function(e) {
      if (e.confirm) {
        confirm(e);
      }
    }
  });
}

// 打电话
function call(tel) {
  wx.makePhoneCall({
    phoneNumber: tel
  });
}

// 打电话，需要传递事件对象(data-tel)
function onCall(event) {
  var dataset = event.currentTarget.dataset;
  var tel = dataset.tel;
  if (undefined !== tel) {
    call(tel);
  } else {
    msg('手机号不能为空');
  }
}

// 缓存城市到本地
function cacheCitys() {
  // 判断城市缓存
  wx.getStorage({
    key: 'citys',
    success: function(res) {},
    fail: function(e) {
      var url = CFG.APP_API_HOST + '/Mall/V2/Area/index';
      httpRequest(url, {
        data: {},
        success: function(res) {
          var citys = res.data;
          var code = res.statusCode;
          if (200 == code && !!citys.length) {
            wx.setStorage({
              key: 'citys',
              data: citys,
              success: function(res) {
                msg('缓存城市成功');
              },
              fail: function() {
                msg('缓存城市失败');
              }
            })
          }
        },
        fail: function() {
          msg('获取城市失败');
        }
      })
    }
  })
}

// 获取省下面的市
function getCitys(cityid, provinceName) {
  var list = [];
  var citys = wx.getStorageSync('citys');
  if (!!citys.length) {
    for (var i in citys) {
      var subArea = citys[i].subAreas;
      var target = null;
      // 省名不为空则以省名为筛选条件
      if (!!provinceName) {
        if (provinceName == citys[i].title) {
          target = subArea
        }
      } else if (cityid == citys[i].areaID) {
        target = subArea
      }
      // format
      if (!!target) {
        for (var j in subArea) {
          var o = {
            id: subArea[j].areaID,
            name: subArea[j].title
          };
          list.push(o);
        }
        return list;
      }
    }
    return list;
  } else {
    msg('城市列表为空');
    return list;
  }
}

// 获取所有的省
function getProvinces() {
  var list = [];
  var citys = wx.getStorageSync('citys');
  if (!!citys.length) {
    for (var i in citys) {
      var o = {
        id: citys[i].areaID,
        name: citys[i].title
      };
      list.push(o);
    }
    return list;
  } else {
    msg('省列表为空');
    return list;
  }
}

// 获取缓存中的城市数据源
function getCacheCitys(){
  var citys = wx.getStorageSync('citys');
  return !!citys?citys:[];
}

// 设置跳转页面
function goTo(page, query) {
  query = !!query ? query : '';
  if (!!page && undefined !== CFG.TO_PAGES[page]) {
    wx.setStorageSync('GO_TO', CFG.TO_PAGES[page]);
    wx.setStorageSync('GO_TO_QUERY', query);
    goHome();
  } else {
    msg('Page doesn\'t exist(Function:goTo)');
    return;
  }
}

// 检测跳转页面
function checkGoTo() {
  var href = wx.getStorageSync('GO_TO')
  var q = wx.getStorageSync('GO_TO_QUERY')
  wx.removeStorageSync('GO_TO')
  wx.removeStorageSync('GO_TO_QUERY')
  if (!!href) {
    href += !!q ? ("?" + q) : '';
    wx.navigateTo({
      url: href
    })
  }
}

// 获取县列表
function getCountys(provinceID, cityID) {
  var list = [];
  var citys = wx.getStorageSync('citys');
  if (!!citys.length) {
    for (var i in citys) {
      var set_citys = citys[i].subAreas;
      if (provinceID == citys[i].areaID) {
        for (var c_id in set_citys) {
          var set_countys = set_citys[c_id].subAreas;
          if (cityID === set_citys[c_id].areaID) {
            for (var x_id in set_countys) {
              var o = {
                id: set_countys[x_id].areaID,
                name: set_countys[x_id].title
              };
              list.push(o);
            }
            return list;
          }
        }
      }
    }
    return list;
  } else {
    msg('城市列表为空');
    return list;
  }
}

// 对象 继承-扩展
function objectExtend(a, b) {
  for (var i in b) {
    a[i] = b[i];
  }
  return a;
}

// 加载中
function showLoading(title, time) {
  title = (undefined !== title) ? title : '加载中';
  time = (undefined !== time) ? time : 10000;
  wx.showToast({
    title: title,
    icon: 'loading',
    duration: time,
    mask: true
  })
}

function hideLoading() {
  wx.hideToast();
}

// 操作成功
function showSuccess(title, time) {
  title = (undefined !== title) ? title : '操作成功';
  time = (undefined !== time) ? time : 3000;
  wx.showToast({
    title: title,
    icon: 'success',
    duration: time,
    mask: true
  })
}

// json反序列化
function objectSerialize(a) {
  var s = [];
  for (var i in a) {
    s.push(i + '=' + a[i])
  }
  return s.join('&');
}

// 隐藏页面加载中图层
function hidePageLoading() {
  var pages = getCurrentPages();
  var currentPage = null;
  if (pages.length > 0) {
    currentPage = pages[pages.length - 1];
    currentPage.setData({
      pageLoading: 'hide'
    });
  }
}

// 封装request
function httpRequest(url, option) {
  if (typeof url !== 'string') {
    msg("httpRequest missing URL :( !");
  }
  var opt = {
    url: url,
    data: {}, //传输data
    method: 'GET', //请求type,默认get
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    encrypt: 1, //是否加密，默认不加密
    success: function(d) {}, //请求成功函数
    fail: function(d) {
      console.log('fail');
      console.log(d);
    }, //请求失败函数
    complete: function(d) {},
    loading: true, //数据加载loading
    pageLoading: false //页面加载loading                           
  }

  var pages = getCurrentPages();
  var currentPage = null;
  if (pages.length > 0) {
    currentPage = pages[pages.length - 1];
  }

  opt = objectExtend(opt, option);
  if (opt.loading) {
    // 优化loading和pageLoading不同时出现
    if (!!currentPage) {
      if (undefined !== currentPage.data.pageLoading) {
        if ('hide' == currentPage.data.pageLoading) {
          showLoading();
        }
      } else {
        if (!opt.pageLoading) {
          showLoading();
        }
      }
    } else if (null === currentPage) {
      showLoading();
    }
  }

  // 检测网络情况：
  wx.getNetworkType({
    success: function(res) {
      var networkType = res.networkType // 返回网络类型2g，3g，4g，wifi, none, unknown
      if ('none' === networkType) {
        msg('当前网络不可用,请检查网络设置!');
        return;
      }
    }
  })

  var queryStr = opt.data;
  // 添加设备类型
  if (typeof queryStr == 'object') {
    queryStr.deviceType = CFG.DEVICE_TYPE;
  } else {
    if (queryStr.indexOf('&') > -1) {
      queryStr += "&deviceType=" + CFG.DEVICE_TYPE;
    } else {
      queryStr += "deviceType=" + CFG.DEVICE_TYPE;
    }
  }

  if (CFG.IS_ENCRYPT) {
    // 加密
    var newDes3 = new DES3.init(CFG.DES3_KEY, CFG.DES3_IV);
    // 对象转URLEncode
    if (typeof queryStr == 'object') {
      queryStr = http_build_query(opt.data);
    }
    console.log(queryStr)
    // 加密
    queryStr = newDes3.encrypt(queryStr);
    if ('GET' == opt.method) {
      opt.method = 'GET';
      queryStr = encodeURIComponent(queryStr);
      url += "?p=" + queryStr;
    } else {
      queryStr = {
        p: queryStr
      };
    }
    opt.data = {
      p: queryStr
    };
  }
  wx.request({
    url: url,
    data: queryStr,
    method: opt.method,
    header: opt.header,
    success: function(res) {
      opt.success(res)
    },
    fail: function(res) {
      opt.fail(res)
    },
    complete: function(res) {
      if (opt.loading) {
        wx.hideToast();
      }
      if (opt.pageLoading) {
        opt.complete(res);
        // 隐藏页面级别加载中
        if (!!currentPage) {
          currentPage.setData({
            pageLoading: 'hide'
          });
        }
      }
    }
  });
}

// 格式化表单数据（不加密不做任何处理）
function makeFormData(mix) {
  if (CFG.IS_ENCRYPT) {
    var queryStr = '';
    // 加密
    var newDes3 = new DES3.init(CFG.DES3_KEY, CFG.DES3_IV);
    // 对象转URLEncode
    if (typeof mix == 'object') {
      queryStr = http_build_query(mix);
    }
    // 加密
    queryStr = newDes3.encrypt(queryStr);
    // queryStr = encodeURIComponent(queryStr);// formdata不需要urlencode,querystring需要urlencode
    mix = {
      p: queryStr
    };
  }
  return mix;
}

// 移除字符串两遍空格
function trim(str) {
  if ('string' !== typeof str) {
    msg('Please input string(Function:trim)');
    return "";
  }
  return str.replace(/(^\s*)|(\s*$)/g, '');
}

// 正则验证
var valid = {
  validRules: {
    'username': /^([\u4E00-\u9FA5]|[a-zA-Z0-9\_]){2,12}$/,
    'realname': /^[\u4e00-\u9fa5]{2,12}$/,
    'mobile': /^0?(13[0-9]|15[012356789]|18[0-9]|14[57]|17[0-9])[0-9]{8}$/,
    'licensenumber': /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$/,
    'captcha': /^[0-9]{6}$/,
  },
  validError: {
    'username': '请检查昵称格式:2-12个字，可由中英文，数字和下划线组成',
    'realname': "请检查姓名格式:2-12个字,只能由中文组成",
    'mobile': '请输入正确的手机号',
    'licensenumber': '车牌号格式不正确',
    'captcha': '验证码格式不正确',
  },
  validEmpty: {
    'username': '姓名不能为空',
    'realname': "姓名不能为空",
    'mobile': '手机号不能为空',
    'licensenumber': '车牌号不能为空',
    'captcha': '验证码不能为空',
  }
}

function validReg(type, val) {
  if (undefined === valid.validRules[type]) {
    msg('请输入正确的校验类型(Function:validReg)');
    return false;
  }

  val = trim(val); // 移除两边空白符
  // 判读非空
  if (val === '') {
    msg(valid.validEmpty[type]);
    return false;
  }
  //正则验证
  if (!valid.validRules[type].test(val)) {
    msg(valid.validError[type]);
    return false;
  } else {
    return true;
  }
}



// 金额格式化函数：(万元)
function formatMoney(str, unit) {
  str = str.toString();
  unit = !!unit ? unit : '万';
  //str = '2100 - 184900';
  var moneyList = [];
  var money = 0;
  var slice = str.split('-');
  if (!!slice.length) {
    for (var i in slice) {
      var m = parseFloat(slice[i]);
      m = (m / 10000).toFixed(2);
      moneyList.push(m);
    }
    money = moneyList.join('-');
  }
  money += unit;
  return money;
}

// 距离格式化函数：(KM)
function formatDistance(str, unit,decimal) {
  decimal = !!decimal?decimal:1;
  str = str.toString();
  unit = !!unit ? unit : 'km';
  var m = parseFloat(str);
  m = Math.ceil((m / 100)) / 10;
  m = m.toFixed(decimal);
  m += unit;
  return m;
}

/**
 * 格式化价格
 * @param  [type]  $price  [要格式的价格数字]
 * @param  boolean $mode [-2:11,000.00带千分符 , -1:11000 , 0:11000.00 , 1:1.1万 , 2:1.1 , (3:300元强转万单位  0.03万 , 4:强转不带万单位)]
 * @return [string]          [显示小数点]
 */
function priceFormat(price, mode) {
  var mode = arguments[1] ? arguments[1] : 1;
  if ((price >= 10000 || mode >= 3) && mode > 0) {
    return numberFormat(price / 10000, 2, '') + (mode > 1 && mode == 4 ? '' : '万');
  } else {
    if (mode == -1) {
      return numberFormat(price, 2, '');
    } else if (mode == -2) {
      return numberFormat(price, 2, ',');
    } else if (mode == -3) {
      return numberFormat(price / 10000, 2, '');
    } else if (mode == -4) {
      return numberFormat(price / 10000, 2, '') + '万';
    } else {
      return numberFormat(price, 2, '');
    }

  }
}

function numberFormat(numbers, bit, sign, gapnum) {
  //判断是字符串就直接返回
  if (isNaN(Number(numbers)) || numbers == '') {
    return numbers;
  }
  //设置接收参数的默认值
  var bit = arguments[1] ? arguments[1] : 2;
  var sign = arguments[2] ? arguments[2] : '';
  var gapnum = arguments[3] ? arguments[3] : 3;
  var str = '';
  numbers = numbers.toFixed(bit); //格式化
  realnum = numbers.split('.')[0]; //整数位
  decimal = numbers.split('.')[1]; //小数位
  realnumarr = realnum.split(''); //将整数位逐位放进数组

  for (var i = 1; i <= realnumarr.length; i++) {
    str = realnumarr[realnumarr.length - i] + str;
    if (i % gapnum == 0 && i < realnumarr.length) {
      str = sign + str;
    }
  }
  realnum = str + '.' + decimal;
  return realnum;
}

// 地址逆解析：根据坐标获取地址信息_{config对象必填参数：lat,lng,可选参数：handler,method,data,header,fail,success,complete}
function getAddrByPos(config) {
  var objPage = config.handler; // 页面对象
  var lat = config.lat;
  var lng = config.lng;

  if (!lng || !lat) {
    msg('getAddrByPosError:location is null');
    return;
  }
  var url = CFG.BAIDU_GEO_API;
  var method = undefined !== config.method ? config.method : 'GET';
  var addrName = '地址解析失败';
  var data = undefined !== config.data ? config.data : {
    location: lat + "," + lng
  };
  var success = config.success;
  var fail = config.fail;
  var complete = config.complete;
  var header = undefined !== config.header ? config.header : {};
  wx.request({
    url: url,
    data: data,
    method: method,
    header: header,
    success: undefined !== success ? success : function(res) {
      var code = res.statusCode;
      var data = res.data;
      if (200 == code && 0 === data.status) {
        var addrInfo = data.result;
        if (undefined !== objPage) {
          addrName = !!addrInfo.formatted_address ? addrInfo.formatted_address : addrName;
          objPage.setData({
            address: addrName
          });
        }

      } else {
        objPage.setData({
          address: addrName
        });
        common.msg('地址解析失败');
      }
    },
    fail: undefined !== fail ? fail : function(res) {
      if (undefined !== objPage) {
        objPage.setData({
          address: addrName
        })
      };
    },
    complete: undefined !== complete ? complete : {}
  });
}

// 计算车龄
function dateDiff(d1) {
  var d1 = new Date(d1);
  var d2 = new Date();
  var m = Math.abs((d2.getFullYear() - d1.getFullYear()) * 12 + d2.getMonth() - d1.getMonth());
  var str = "";
  if ((m / 12 >> 0) == 0 && (m % 12) != 0) {
    if (d2.getDate() > d1.getDate()) {
      str = ((m % 12) + 1).toString() + "个月";
    } else {
      str = (m % 12).toString() + "个月";
    }
  } else if ((m / 12 >> 0) != 0 && (m % 12) == 0) {
    if (d2.getDate() > d1.getDate()) {
      str = (m / 12 >> 0).toString() + "年" + "1个月";
    } else {
      str = (m / 12 >> 0).toString() + "年";
    }
  } else if ((m / 12 >> 0) == 0 && (m % 12) == 0) {
    str = "1个月";
  } else if ((m / 12 >> 0) != 0 && (m % 12) != 0) {
    if (d2.getDate() > d1.getDate()) {
      str = (m / 12 >> 0).toString() + "年" + ((m % 12) + 1).toString() + "个月";
    } else {
      str = (m / 12 >> 0).toString() + "年" + (m % 12).toString() + "个月";
    }

  }
  // console.log("%s年%d个月",m/12>>0,m%12);
  return str;
}

// 判断会话token是否过期
function checkToken(callbackObj) {
  var def_callback = {
    complete: function(e) {
      console.log(e);
    },
    fail: function(e) {
      console.log(e);
      wx.navigateTo({
        url: '/pages/user/login/index'
      });
    },
    success: function(e) {
      console.log(e);
    }
  };
  if ('object' !== typeof callbackObj) {
    callbackObj = def_callback;
  }
  def_callback.complete = !!callbackObj.complete ? callbackObj.complete : def_callback.complete;
  def_callback.fail = !!callbackObj.fail ? callbackObj.fail : def_callback.fail;
  def_callback.success = !!callbackObj.success ? callbackObj.success : def_callback.success;

  var token = wx.getStorageSync('token');
  if ('' == token) {
    def_callback.fail({
      'msg': 'token为空'
    });
    return;
  }
  //获取用户登陆信息
  var url = CFG.APP_API_HOST + 'Account/V2/Users';
  httpRequest(url, {
    pageLoading:true,
    data: {
      token: token,
    },
    success: function(res) {
      var statusCode = res.statusCode;
      var login_info = res.data;
      if (statusCode == 200) {
        def_callback.success(res);
      } else {
        def_callback.fail(res);
      }
    },
    fail: function(e) {
      def_callback.fail(e);
    },
    complete: function(e) {
      def_callback.complete(e);
    }
  })
}

// 返回到首页
function goHome() {
  wx.navigateBack({
    delta: 10
  });
}

module.exports = {
  formatDate: formatDate,
  http_build_query: http_build_query,
  msg: msg,
  onCall: onCall,
  cacheCitys: cacheCitys,
  getProvinces: getProvinces,
  getCitys: getCitys,
  getCacheCitys:getCacheCitys,
  httpRequest: httpRequest,
  showLoading: showLoading,
  showSuccess: showSuccess,
  hideLoading: hideLoading,
  formatMoney: formatMoney,
  numberFormat: numberFormat,
  priceFormat: priceFormat,
  validReg: validReg,
  getAddrByPos: getAddrByPos,
  getCountys: getCountys,
  dateDiff: dateDiff,
  formatDistance: formatDistance,
  checkToken: checkToken,
  hidePageLoading: hidePageLoading,
  trim: trim,
  goHome: goHome,
  goTo: goTo,
  checkGoTo: checkGoTo,
  makeFormData: makeFormData,
  timeCompare : timeCompare,
  diffDays : diffDays
}