var CFG = {
  // [APP接口配置]
  APP_API_HOST: '',// APP商城接口地址
  MAINTAIN_APP_API_HOST: '',// APP保养接口地址
  USERDCAR_APP_API_HOST: '',// APP二手车接口地址
  IS_ENCRYPT: false,
  DES3_KEY: '',// APP KEY
  DES3_IV: '01234567',
  SITE_ID: '',// 武汉站点ID
  SITE_NAME: '武汉', //站点名称

  // [二手车相关key]
  INTERFACE_KEY: {},

  // [地图接口相关配置]
  BAIDU_MAP_AK: 'wqBXfIN3HkpM1AHKWujjCdsi', // 百度地图AK
  BAIDU_GEO_API: 'https://api.map.baidu.com/geocoder/v2/?output=json&pois=0&coordtype=wgs84ll&ak=',//gcj02ll

  // [其他配置]
  ADMIN_EMAIL: 'i@phpjungle.com',
  SHARE_DESC: '恒信汽车管家_汽车生活一站式服务平台', // 小程序页面分享标题
  DEVICE_TYPE: 'weChat',
  DEFAULT_AVATAR: 'http://m.hxqc.com/wxapp/index/tx-default.png', // 默认用户图像

  // [默认武汉坐标]
  WUHAN_LAT: '30.553469',
  WUHAN_LNG: '114.210806',
  TO_PAGES: {}, // 页面映射

  // [线上环境：www  预上线：www.t 测试环境: test ]
  ENV: 'test'
};
CFG.BAIDU_GEO_API += CFG.BAIDU_MAP_AK;

// 环境判断
switch (CFG.ENV) {
  case 'www':
    CFG.APP_API_HOST = 'https://app-interface.hxqc.com/';// APP商城接口地址
    CFG.MAINTAIN_APP_API_HOST = 'https://maintain-interface-goods.admin.hxqc.com/v1/';// APP保养接口地址
    CFG.USERDCAR_APP_API_HOST = 'https://app-interface.hxqc.com/Usedcar/V2/';// APP二手车接口地址
    CFG.S_IMG_HOST = 'http://s.hxqc.com/';//图片地址
    CFG.DES3_KEY = '^0f0wo@!m6s*89^n0#&nh;d$';
    CFG.SITE_ID = '1639797187704660';// 线上武汉站点ID
    CFG.IS_ENCRYPT = true;
    CFG.INTERFACE_KEY = {
      "SELL_CAR": "*31)_LoY5%2Ps^488(*l1*9gU3l!@d&0",
      "BUY_CAR": "&MiTb(3O2P145%sk2@@3jhs^1kmzz!8$",
      "ONSALE_CAR_OPERATION": "#$11&nYYesOiIl2*64^2msWq2Re3&AnV",
      "COMPLAIN_CAR": "(UjU29$12o(*DmIw53kl(67#@2k26&^G",
      "SUBSCRIBE": "UM6Oslw%3)(11oEBfdCyz^4(*2KaOw90",
      "ATTENTION": "&kSj2#iu*oO1%slM3sp@lla%aQdBbndD",
      "APPEAL": "lHtM3)2I%6xc#2mHe1*6kOqpLSny3*bs",
      "APPLYOFFSALE": "zOwrmD1#wl5%192P9!z4Gly1q&l6a@cs",
      "UPLOAD": "elkj#%04oik&hPHp13)5bpij2$5oj)4o",
      "PLATFORMSELL": "e48b@574aHeO7e&1cE134c8B7*e0624!",
      'CENTER': "hfghe54yhfua#tr$2;@sdksdfiksl;d3"
    };
    break;
  case 'www.t':
    CFG.APP_API_HOST = 'https://app-interface.t.hxqc.com/';// APP商城接口地址-预上线
    CFG.MAINTAIN_APP_API_HOST = 'https://maintain-interface-goods.tadmin.hxqc.com/v1/';// APP保养接口地址-预上线
    CFG.USERDCAR_APP_API_HOST = 'https://app-interface.t.hxqc.com/Usedcar/V2/';// APP二手车接口地址-预上线
    CFG.S_IMG_HOST = 'http://s.t.hxqc.com/';//图片地址
    CFG.DES3_KEY = '^0f0wo@!m6s*89^n0#&nh;d$'; // 预上线key
    CFG.SITE_ID = '1639797187704660'; // 武汉站点ID
    CFG.IS_ENCRYPT = true;
    CFG.INTERFACE_KEY = {
      "SELL_CAR": "*31)_LoY5%2Ps^488(*l1*9gU3l!@d&0",
      "BUY_CAR": "&MiTb(3O2P145%sk2@@3jhs^1kmzz!8$",
      "ONSALE_CAR_OPERATION": "#$11&nYYesOiIl2*64^2msWq2Re3&AnCommon/getGroupBrandCommon/getGroupBrandCommon/getGroupBrandCommon/getGroupBrand      电饭锅Common/getGroupBrandCommon/getGroupBrandCommon/getGroupBrandasfd  lk asd  fafd  saf sa fV",
      "COMPLAIN_CAR": "(UjU29$12o(*DmIw53kl(67#@2k26&^G",
      "SUBSCRIBE": "UM6Oslw%3)(11oEBfdCyz^4(*2KaOw90",
      "ATTENTION": "&kSj2#iu*oO1%slM3sp@lla%aQdBbndD",
      "APPEAL": "lHtM3)2I%6xc#2mHe1*6kOqpLSny3*bs",
      "APPLYOFFSALE": "zOwrmD1#wl5%192P9!z4Gly1q&l6a@cs",
      "UPLOAD": "elkj#%04oik&hPHp13)5bpij2$5oj)4o",
      "PLATFORMSELL": "e48b@574aHeO7e&1cE134c8B7*e0624!",
      'CENTER': "hfghe54yhfua#tr$2;@sdksdfiksl;d3"
    };
    break;
  case 'test':
    CFG.APP_API_HOST = 'http://app-interface.t.hxqctest.com/';// APP商城接口地址-测试环境
    CFG.MAINTAIN_APP_API_HOST = 'http://maintain-interface-goods.tadmin.hxqctest.com/v1/';// APP保养接口地址-测试环境
    CFG.USERDCAR_APP_API_HOST = 'http://app-interface.t.hxqctest.com/Usedcar/V2/';// APP二手车接口地址-测试环境
    CFG.S_IMG_HOST = 'http://s.t.hxqctest.com/';//图片地址
    CFG.DES3_KEY = '';
    CFG.SITE_ID = '1639328539308827';
    CFG.IS_ENCRYPT = false;
    CFG.INTERFACE_KEY = {
      "SELL_CAR": "*31)_LoY5%2Ps^488(*l1*9gU3l!@d&0",
      "BUY_CAR": "&MiTb(3O2P145%sk2@@3jhs^1kmzz!8$",
      "ONSALE_CAR_OPERATION": "#$11&nYYesOiIl2*64^2msWq2Re3&AnV",
      "COMPLAIN_CAR": "(UjU29$12o(*DmIw53kl(67#@2k26&^G",
      "SUBSCRIBE": "UM6Oslw%3)(11oEBfdCyz^4(*2KaOw90",
      "ATTENTION": "&kSj2#iu*oO1%slM3sp@lla%aQdBbndD",
      "APPEAL": "lHtM3)2I%6xc#2mHe1*6kOqpLSny3*bs",
      "APPLYOFFSALE": "zOwrmD1#wl5%192P9!z4Gly1q&l6a@cs",
      "UPLOAD": "elkj#%04oik&hPHp13)5bpij2$5oj)4o",
      "PLATFORMSELL": "e48b@574aHeO7e&1cE134c8B7*e0624!",
      'CENTER': "hfghe54yhfua#tr$2;@sdksdfiksl;d3"
    };
    break;
}

// TO_PAGES
CFG.TO_PAGES = { 'ORDER_LIST': '/pages/user/order/index','NEWCAR_DETAIL':'/pages/shop/newcar/detail','SHOP_INDEX':'/pages/shop/recomshop/detail'}

module.exports = {
  ADMIN_EMAIL: CFG.ADMIN_EMAIL,
  APP_API_HOST: CFG.APP_API_HOST,
  USERDCAR_APP_API_HOST: CFG.USERDCAR_APP_API_HOST,
  S_IMG_HOST: CFG.S_IMG_HOST,
  DES3_KEY: CFG.DES3_KEY,
  DES3_IV: CFG.DES3_IV,
  SHARE_DESC: CFG.SHARE_DESC,
  INTERFACE_KEY: CFG.INTERFACE_KEY,
  WX_PAY_HOST: CFG.WX_PAY_HOST,
  SITE_ID: CFG.SITE_ID,
  SITE_NAME: CFG.SITE_NAME,
  DEVICE_TYPE: CFG.DEVICE_TYPE,
  IS_ENCRYPT: CFG.IS_ENCRYPT,
  MAINTAIN_APP_API_HOST: CFG.MAINTAIN_APP_API_HOST,
  DEFAULT_AVATAR: CFG.DEFAULT_AVATAR,
  BAIDU_MAP_AK: CFG.BAIDU_MAP_AK,
  BAIDU_GEO_API: CFG.BAIDU_GEO_API,
  WUHAN_LAT: CFG.WUHAN_LAT,
  WUHAN_LNG: CFG.WUHAN_LNG,
  TO_PAGES: CFG.TO_PAGES
}
