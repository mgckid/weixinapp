var CFG = require('../../../../utils/config.js')
var common = require('../../../../utils/util.js')
var tool = require('../../../../utils/md5.js');
var car_source_no = '';
var objPage = null;
var stime = '';
var car_sale = {'0':'待上架','1':'上架','2':'下架','3':'已售','4':'申请下架','5':'被订购下架'};

function getBuyCarDetail(id) {
  // 详情头部接口请求
  var url = CFG.USERDCAR_APP_API_HOST + 'BuyCar/queryItemDetail';
  common.httpRequest(
    url,{
      pageLoading: true,
    data: {
      car_source_no: id
    },
    success: function (res) {
      var statusCode = res.statusCode;
      var detailInfo = {};
      var info = res.data;
      var new_car_price = '';
      if (200 == statusCode && undefined !== info.car_source_no) {
        //缓存车辆图片
        if(info.image.length > 0) {
            var car_image = info.image;
            wx.setStorage({
              key: 'car_img_list',
              data: car_image
            })
        }

        //获取本地特色服务计算后的缓存数据
        wx.getStorage({
          key: 'new_car_info',
          success: function(e) {  
            new_car_price = e.data.new_car_price;
            if(new_car_price) {
              info.estimate_price = new_car_price;
            }

            //认证详情选中状态设置
            var fenqi = e.data.instalment_id;
            var zhibao = e.data.qa_id;
            var serviceStatus = {};
            if(fenqi) {
            serviceStatus.fenqi = fenqi;
            }
            if(zhibao) {
              serviceStatus.zhibao = zhibao;
            }
            objPage.setData({serviceStatus: serviceStatus});

            //radio状态选择
            wx.setStorage({
              key: "serviceStatus",
              data: serviceStatus
            })

            var tax_price = (parseFloat(info.new_car_price) + parseFloat(info.purchase)).toFixed(2);
            var economize = (parseFloat(tax_price) - parseFloat(info.estimate_price)).toFixed(2);
            info.tax_price = tax_price;
            info.economize = economize;
            info.img_length = info.image.length;
            info.first_on_card_age = common.dateDiff(info.first_on_card);
            info.first_on_card = common.formatDate(info.first_on_card, 'Y-MM');
            objPage.setData({ detailInfo: info });
          } 
        })

        //设置二手车买车车源编号
        var car_no = info.car_source_no;
        wx.setStorage({
          key: "car_source_no",
          data: car_no
        })

        //分期购车本地缓存
        var quality = {};
        var instalment = wx.getStorageSync('item_instalment');
        if(!instalment) {
          quality.car_source_no = id;
          quality.item_insment = info.qa.item_instalment;
          wx.setStorage({
            key: "item_instalment",
            data: quality
          })
        }

        //恒信质保本地缓存
        var stag = {};
        var itemQa = wx.getStorageSync('item_qa');
        if(!itemQa) {
          stag.car_source_no = id;
          stag.info_qa = info.qa.item_qa;
          wx.setStorage({
            key: "item_qa",
            data: stag
          })
        }
      }
    }
  })

  //详情下部接口请求
  var urlButton = CFG.USERDCAR_APP_API_HOST + 'Mobile/carInfo';
  common.httpRequest(
    urlButton,{
      loading: false,
    data: {
      car_source_no: id
    },
    success: function (res) {
      var statusCode = res.statusCode;
      var detailButtonInfo = {};
      var info = res.data;
      if (200 == statusCode && !! info.carDetail) {
        //数据重组
        if(info.carconfig == null) {
          info.carconfig = {};
        }

        var detinfo = info.detinfo;
        var guiseinfo = info.guiseinfo;

        //合并外观内饰滚动图片
        var imglist =[];
        if(guiseinfo['out']) {
          guiseinfo['outlength'] = guiseinfo['out'].length;
          imglist = imglist.concat(guiseinfo['out']);
        }
        if(guiseinfo['in']) {
          guiseinfo['inlength'] = guiseinfo['in'].length;
          imglist = imglist.concat(guiseinfo['in']);
        }
        var imgnewlist = [];
        for(var i in imglist) {
          var r = imglist[i];
          if(r.path) {
            imgnewlist.push({'img': CFG.S_IMG_HOST + 'newcar/mall/usedcar' + r.path, 'desc':r.desc});
          }
        }
        objPage.setData({'imgLength':imgnewlist.length});
        info.imglist = imgnewlist;

        //质量检测
        detinfo['驾驶检测'] = detinfo['驾驶检测'] ? detinfo['驾驶检测'] : 0;
        detinfo['启动'] = detinfo['启动'] ? detinfo['启动'] : 0;
        detinfo['起步'] = detinfo['起步'] ? detinfo['起步'] : 0;
        detinfo['加速'] = detinfo['加速'] ? detinfo['加速'] : 0;
        detinfo['匀速行驶'] = detinfo['匀速行驶'] ? detinfo['匀速行驶'] : 0;
        detinfo['减速与制动'] = detinfo['减速与制动'] ? detinfo['减速与制动'] : 0;
        var zljc = [{'事故检测':[{'text':'排除重大撞击','deval':'17项','value':detinfo['重大碰撞']},
                                {'text':'排除火烧车','deval':'5项','value':detinfo['火烧']},
                                {'text':'排除泡水','deval':'8项','value':detinfo['泡水']}]},
                    {'外观内饰检测':[{'text':'外观检测','deval':'20项','value':guiseinfo['outlength']},
                                    {'text':'排除火烧车','deval':'6项','value':guiseinfo['inlength']}]},
                    {'安全检测':[{'text':'刹车系统','deval':'12项','value':detinfo['刹车系统A']},
                                {'text':'轮胎','deval':'8项','value':detinfo['轮胎检测']},
                                {'text':'被动安全系统','deval':'6项','value':detinfo['刹车系统B']},
                                {'text':'排查起火隐患','deval':'2项','value':detinfo['排查起火隐患']},
                                {'text':'指示灯检测','deval':'11项','value':detinfo['指示灯检测']},
                                {'text':'电子设备检测','deval':'9项','value':detinfo['电子设备检测']}]},
                    {'驾驶检测':[{'text':'排查烧油、漏油','deval':'6项','value':detinfo['排查烧油、漏油']},
                                {'text':'动态检测','deval':'22项','value':parseInt(detinfo['驾驶检测']) + parseInt(detinfo['启动']) 
                                + parseInt(detinfo['起步']) + parseInt(detinfo['加速']) + parseInt(detinfo['匀速行驶']) 
                                + parseInt(detinfo['减速与制动'])}]}
        ];
        info.zljc = zljc;

        var zhongkong = info.carconfig['车内中控锁'] != '-' && info.carconfig['车内中控锁'] != null ? 1 : 0;
        var yaokong = info.carconfig['遥控钥匙'] != '-' && info.carconfig['遥控钥匙'] != null ? 2 : 0;
        switch (zhongkong + yaokong) {
            case 3: 
              info.carconfig['zk'] = '中控锁、遥控钥匙'; 
            break;
            case 2: 
              info.carconfig['zk'] = '遥控钥匙';
            break;
            case 1: 
              info.carconfig['zk'] = '中控锁'; 
            break;
            case 0: 
              info.carconfig['zk'] = '-';
            break;
        }

        info.carconfig['长*宽*高(mm)'] = info.carconfig['长*宽*高(mm)'] ? info.carconfig['长*宽*高(mm)'].replace(/\*/g, "/") : '';

        if(info.carconfig['主/副驾驶座安全气囊']) {
          info.carconfig['zhu'] = info.carconfig['主/副驾驶座安全气囊'].indexOf('主');
          if(info.carconfig['zhu'] > -1) {
            info.carconfig['zhu'] = '标配';
          } else {
            info.carconfig['zhu'] = '-';
          }
          info.carconfig['fu'] = info.carconfig['主/副驾驶座安全气囊'].indexOf('副');
          if(info.carconfig['fu'] > -1) {
            info.carconfig['fu'] = '标配';
          } else {
            info.carconfig['fu'] = '-';
          }
        } else {
          info.carconfig['zhu'] = '-';
           info.carconfig['fu'] = '-';
        }

        info.carDetail.detail.car_on_sale_name = car_sale[info.carDetail.detail.car_on_sale];

        //事故排查处理
        var sgpc = [{type:1,line:4},{type:1,line:2},{type:1,line:17},{type:1,line:12},{type:1,line:8},
                    {type:2,line:6},{type:2,line:14},{type:2,line:10},{type:2,line:16},
                    {type:3,line:3},{type:3,line:13},{type:3,line:5},{type:3,line:9},
                    {type:4,line:7},{type:4,line:11},{type:4,line:1},{type:4,line:15}
        ];
        info.sgpc = sgpc;

        //排除重大碰撞
        var pczdpz = [{text:'左A柱',value:detinfo['左A柱']},{text:'右A柱',value:detinfo['右A柱']},
          {text:'左B柱',value:detinfo['左B柱']},{text:'右B柱',value:detinfo['右B柱']},
          {text:'左C柱',value:detinfo['左C柱']},{text:'右C柱',value:detinfo['右C柱']},
          {text:'左前纵梁',value:detinfo['左前纵梁']},{text:'右前纵梁',value:detinfo['右前纵梁']},
          {text:'左后纵梁',value:detinfo['左后纵梁']},{text:'右后纵梁',value:detinfo['右后纵梁']},
          {text:'左前减震器悬挂部位',value:detinfo['左前减震器悬挂部位']},{text:'右前减震器悬挂部位',value:detinfo['右前减震器悬挂部位']},
          {text:'左后减震器悬挂部位',value:detinfo['左后减震器悬挂部位']},{text:'右后减震器悬挂部位',value:detinfo['右后减震器悬挂部位']},
          {text:'车身底板',value:detinfo['车身底板']},{text:'后备箱底板',value:detinfo['后备箱底板']},
          {text:'防火墙',value:detinfo['防火墙']},
        ];
        objPage.setData({pc_len:Math.ceil(pczdpz.length/2)});
        info.pczdpz = pczdpz;

        //排除火烧
        var pchs = [{text:'部件无火烧痕迹',value:detinfo['部件是否存在过火燃烧痕迹']},
          {text:'部件无烟熏痕迹',value:detinfo['部件是否存在烟熏痕迹']},
          {text:'线束和发动机舱无更换',value:detinfo['线束和发动机舱塑料材质是否都进行了更换']},
          {text:'内饰无烧焦气味',value:detinfo['内饰是否有烧焦气味']},
          {text:'内饰无大量更换',value:detinfo['内饰是否存在大量更换部件']},
        ];
        objPage.setData({hs_len:Math.ceil(pchs.length/2)});
        info.pchs = pchs;

        //排除泡水
        var pcps = [{text:'发动机舱线束和接头',value:detinfo['发动机舱线束和接头是否存在泥沙']},
          {text:'后备箱工具槽',value:detinfo['后备箱工具槽是否存在水浸和泥沙痕迹']},
          {text:'安全带内侧、B柱饰板',value:detinfo['安全带内侧、B柱饰板是否有水浸痕迹']},
          {text:'避震器和底盘',value:detinfo['避震器和底盘是否存在大面积锈蚀痕迹']},
          {text:'地毯',value:detinfo['地毯是否有水浸僵化痕迹']},
          {text:'车辆顶棚',value:detinfo['车辆顶棚是否存在水浸痕迹']},
          {text:'保险盒、座椅划轨',value:detinfo['保险盒、进气口、座椅划轨是否存在泥沙']},
          {text:'仪表台出风口',value:detinfo['仪表台出风口是否存在泥沙水泡痕迹']},
        ];
        objPage.setData({ps_len:Math.ceil(pcps.length/2)});
        info.pcps = pcps;

        //系统设备检测
        var twsd = [];    //胎纹深度
        if(detinfo['胎纹深度-左前'] || detinfo['胎纹深度-右前'] || detinfo['胎纹深度-左后'] || detinfo['胎纹深度-右后']) {
          if(detinfo['胎纹深度-左前']) {
            twsd.push(detinfo['胎纹深度-左前']);
          }
          if(detinfo['胎纹深度-右前']) {
            twsd.push(detinfo['胎纹深度-右前']);
          }
          if(detinfo['胎纹深度-左后']) {
            twsd.push(detinfo['胎纹深度-左后']);
          }
          if(detinfo['胎纹深度-右后']) {
            twsd.push(detinfo['胎纹深度-右后']);
          }
          twsd = twsd.join('、');
        } else {
          twsd = '';
        }

        var ty = [];    //胎压
        if(detinfo['胎压-左前'] || detinfo['胎压-右前'] || detinfo['胎压-左后'] || detinfo['胎压-右后']) {
          if(detinfo['胎压-左前']) {
            ty.push(detinfo['胎压-左前']);
          }
          if(detinfo['胎压-右前']) {
            ty.push(detinfo['胎压-右前']);
          }
          if(detinfo['胎压-左后']) {
            ty.push(detinfo['胎压-左后']);
          }
          if(detinfo['胎压-右后']) {
            ty.push(detinfo['胎压-右后']);
          }
          ty = ty.join('、');
        } else {
          ty = '';
        }

        var scp = [];    //刹车片
        if(detinfo['刹车片-左前'] || detinfo['刹车片-右前'] || detinfo['刹车片-左后'] || detinfo['刹车片-右后']) {
          if(detinfo['刹车片-左前']) {
            scp.push(detinfo['刹车片-左前']);
          }
          if(detinfo['刹车片-右前']) {
            scp.push(detinfo['刹车片-右前']);
          }
          if(detinfo['刹车片-左后']) {
            scp.push(detinfo['刹车片-左后']);
          }
          if(detinfo['刹车片-右后']) {
            scp.push(detinfo['刹车片-右后']);
          }
          scp = scp.join('、');
        } else {
          scp = '';
        }

        var zdkq = [];    //制动卡钳
        if(detinfo['制动卡钳-左前'] || detinfo['制动卡钳-右前'] || detinfo['制动卡钳-左后'] || detinfo['制动卡钳-右后']) {
          if(detinfo['制动卡钳-左前']) {
            zdkq.push(detinfo['制动卡钳-左前']);
          }
          if(detinfo['制动卡钳-右前']) {
            zdkq.push(detinfo['制动卡钳-右前']);
          }
          if(detinfo['制动卡钳-左后']) {
            zdkq.push(detinfo['制动卡钳-左后']);
          }
          if(detinfo['制动卡钳-右后']) {
            zdkq.push(detinfo['制动卡钳-右后']);
          }
          zdkq = zdkq.join('、');
        } else {
          zdkq = '';
        }

        var zcxt = [];    //驻车系统
        if(detinfo['驻车系统-左前'] || detinfo['驻车系统-右前'] || detinfo['驻车系统-左后'] || detinfo['驻车系统-右后']) {
          if(detinfo['驻车系统-左前']) {
            zcxt.push(detinfo['驻车系统-左前']);
          }
          if(detinfo['驻车系统-右前']) {
            zcxt.push(detinfo['驻车系统-右前']);
          }
          if(detinfo['驻车系统-左后']) {
            zcxt.push(detinfo['驻车系统-左后']);
          }
          if(detinfo['驻车系统-右后']) {
            zcxt.push(detinfo['驻车系统-右后']);
          }
          zcxt = zcxt.join('、');
        } else {
          zcxt = '';
        }

        var xtsbjc = [
          {'list':[{'text':'安全带系统','value':detinfo['安全带系统']},
                          {'text':'安全气囊系统','value':detinfo['安全气囊系统']},
                          {'text':'防抱死系统（ABS）','value':detinfo['防抱死系统（ABS）']},
                          {'text':'车身稳定系统（ESP）','value':detinfo['车身稳定系统（ESP）']},
                          {'text':'轮胎胎压','value':detinfo['轮胎胎压']},
                          {'text':'儿童座椅接口','value':detinfo['儿童座椅接口']}
                         ],
           'row':3,'title':'安全系统检测'
          },
          {'list':[{'text':'车灯系统','value':detinfo['车灯系统']},
                          {'text':'仪表指示灯','value':detinfo['仪表板指示灯']},
                          {'text':'雨刷器','value':detinfo['雨刷器']},
                          {'text':'空调系统','value':detinfo['空调系统']},
                          {'text':'多媒体系统','value':detinfo['多媒体系统']},
                          {'text':'电动车窗','value':detinfo['电动天窗']},
                          {'text':'中控锁','value':detinfo['中央集控']},
                          {'text':'座椅电动功能','value':detinfo['座椅调节与加热']}
                         ],
           'row':4,'title':'电子设备检测'
          },
          {'list'    :[{'text':'胎纹深度','value':twsd},
                          {'text':'胎压','value':ty}
                         ],
           'row':1,'title':'轮胎系统'
          },
          {'list':[{'text':'刹车片','value':scp},
                          {'text':'制动卡钳','value':zdkq},
                          {'text':'驻车系统','value':zcxt}
                         ],
           'row':2,'title':'刹车系统检测'
          },
          {'list':  [{'text':'左前大灯','value':detinfo['左前大灯']},
                          {'text':'后雾灯','value':detinfo['后雾灯']},
                          {'text':'右前大灯','value':detinfo['右前大灯']},
                          {'text':'日间行车灯','value':detinfo['日间行车灯']},
                          {'text':'左前转向灯','value':detinfo['左前转向灯']},
                          {'text':'倒车灯','value':detinfo['倒车灯']},
                          {'text':'右前转向灯','value':detinfo['右前转向灯']},
                          {'text':'座椅电动功能','value':detinfo['座椅调节与加热']},
                          {'text':'右后转向灯','value':detinfo['右后转向灯']},
                          {'text':'左后刹车灯','value':detinfo['左后刹车灯']},
                          {'text':'右后刹车灯','value':detinfo['右后刹车灯']}
                         ],
           'row':6,'title':'指示灯检测'
          }
        ];
        info.xtsbjc = xtsbjc;

        //驾驶检测
        var fdj = [];
        if(detinfo['发动机-正常'] || detinfo['发动机-异常']) {
          if(detinfo['发动机-正常']) {
            fdj.push(detinfo['发动机-正常']);
          }
          if(detinfo['发动机-异常']) {
            fdj.push(detinfo['发动机-异常']);
          }
          fdj = fdj.join('、');
        } else {
          var fdj = '';
        }
        var bsx = [];
        if(detinfo['变速箱-正常'] || detinfo['变速箱-异常']) {
          if(detinfo['变速箱-正常']) {
            bsx.push(detinfo['变速箱-正常']);
          }
          if(detinfo['变速箱-异常']) {
            bsx.push(detinfo['变速箱-异常']);
          }
          bsx = bsx.join('、');
        } else {
          bsx = '';
        }
        var dsdd = [];
        if(detinfo['怠速抖动-有'] || detinfo['怠速抖动-无']) {
          if(detinfo['怠速抖动-有']) {
            dsdd.push(detinfo['怠速抖动-有']);
          }
          if(detinfo['怠速抖动-无']) {
            dsdd.push(detinfo['怠速抖动-无']);
          }
          dsdd = dsdd.join('、');
        } else {
          dsdd = '';
        }
        var zxflg = [];
        if(detinfo['转向乏力感-有'] || detinfo['转向乏力感-无']) {
          if(detinfo['转向乏力感-有']) {
            zxflg.push(detinfo['转向乏力感-有']);
          }
          if(detinfo['转向乏力感-无']) {
            zxflg.push(detinfo['转向乏力感-无']);
          }
          zxflg = zxflg.join('、');
        } else {
          zxflg = '';
        }
        var bsscddc = [];
        if(detinfo['变速时闯档顿挫-有'] || detinfo['变速时闯档顿挫-无']) {
          if(detinfo['变速时闯档顿挫-有']) {
            bsscddc.push(detinfo['变速时闯档顿挫-有']);
          }
          if(detinfo['变速时闯档顿挫-无']) {
            bsscddc.push(detinfo['变速时闯档顿挫-无']);
          }
          bsscddc = bsscddc.join('、');
        } else {
          bsscddc = '';
        }

        var lqyhr = [];
        if(detinfo['机油冷却液混入-发动机'] || detinfo['机油冷却液混入-变速箱'] || detinfo['机油冷却液混入-转向机']) {
          if(detinfo['机油冷却液混入-发动机']) {
            lqyhr.push(detinfo['机油冷却液混入-发动机']);
          }
          if(detinfo['机油冷却液混入-变速箱']) {
            lqyhr.push(detinfo['机油冷却液混入-变速箱']);
          }
          if(detinfo['机油冷却液混入-转向机']) {
            lqyhr.push(detinfo['机油冷却液混入-转向机']);
          }
          lqyhr = lqyhr.join('、');
        } else {
          lqyhr = '';
        }

        var jysl = [];
        if(detinfo['缸盖外机油渗漏-发动机'] || detinfo['缸盖外机油渗漏-变速箱'] || detinfo['缸盖外机油渗漏-转向机']) {
          if(detinfo['缸盖外机油渗漏-发动机']) {
            jysl.push(detinfo['缸盖外机油渗漏-发动机']);
          }
          if(detinfo['缸盖外机油渗漏-变速箱']) {
            jysl.push(detinfo['缸盖外机油渗漏-变速箱']);
          }
          if(detinfo['缸盖外机油渗漏-转向机']) {
            jysl.push(detinfo['缸盖外机油渗漏-转向机']);
          }
          jysl = jysl.join('、');
        } else {
          jysl = '';
        }

        var jsjc = [{'驾驶检测':[{text:'发动机',value: fdj},{text:'变速箱',value: bsx},{text:'怠速抖动',value: dsdd},
                            {text:'转向乏力感',value: zxflg},{text:'变速时闯档顿挫',value: bsscddc}]},
                    {'启动':[{text:'刹车片',value: detinfo['启动-刹车片']},{text:'驻车系统',value: detinfo['启动-驻车系统']}]},
                    {'起步':[{text:'发动机',value: detinfo['起步-发动机']},{text:'变速箱',value: detinfo['起步-变速箱']},
                            {text:'悬挂系统',value: detinfo['起步-悬挂系统']}]},
                    {'加速':[{text:'发动机',value: detinfo['加速-发动机']},{text:'变速箱',value: detinfo['加速-变速箱']},
                            {text:'悬挂系统',value: detinfo['加速-传动系统']}]},
                    {'匀速行驶':[{text:'发动机',value: detinfo['匀速行驶-发动机']},{text:'变速箱',value: detinfo['匀速行驶-变速箱']},
                            {text:'悬挂系统',value: detinfo['匀速行驶-悬挂系统']},{text:'转向系统',value: detinfo['匀速行驶-转向系统']},
                            {text:'制动系统',value: detinfo['匀速行驶-制动系统']}]},
                    {'减速与制动':[{text:'发动机',value: detinfo['减速与制动-发动机']},
                                  {text:'变速箱',value: detinfo['减速与制动-变速箱']},
                                  {text:'转向系统',value: detinfo['减速与制动-传动系统']},
                                  {text:'悬挂系统',value: detinfo['减速与制动-悬挂系统']}]},
                    {'排查烧油、漏油':[{text:'机油冷却液混入',value: lqyhr},{text:'缸盖外机油渗漏',value: jysl}]}
        ];

        info.jsjc = jsjc;
        objPage.setData({ detailButtonInfo: info });
      }
    }
  })
}

//预约看车数据提交
function subscribeCar(data) {
  var mobile = data.mobile;
  var captcha = data.captcha;
  var carSourceId = data.carSourceId;
  var time = objPage.data.time;

  //数据效验
  var key = CFG.INTERFACE_KEY.BUY_CAR;
  var timestamp = Date.parse(new Date())/1000;
  var effectData = [mobile, 'BUY_CAR', timestamp];
  effectData.sort();
  var effectDataStr = effectData.join(key);
  var sign = tool.md5(effectDataStr);

  var chk_mobile = common.validReg('mobile', mobile);
  if(!chk_mobile) {
    //common.msg('手机号格式不正确');
    return false;
  }

  var chk_captcha = common.validReg('captcha', captcha);
  if(!chk_captcha) {
    return false;
  }

  if(!time) {
    common.msg('请选择预约时间');
    return false;
  }

  var url = CFG.USERDCAR_APP_API_HOST + '/BuyCar/reserve';
  common.httpRequest(
    url,{
      pageLoading: true,
    data: {
      mobile: mobile,
      captcha: captcha,
      carSourceId: carSourceId,
      sign: sign,
      timestamp: timestamp,
      time: time
    },
    method: 'POST', 
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    success: function (res) {
      var statusCode = res.statusCode;
      var info = res.data;
      if (200 == statusCode) {
        common.msg('提交预约成功', '', function() {
          objPage.setData({ switch_show: '' })
        });
      } else {
        if(info.code == 1) {
          common.msg(info.message, '', function(e) {
            objPage.setData({ switch_show: '' })
          });
        }
        if(info.code == 400) {
          common.msg(info.message);
          return false;
        }
      }
      objPage.setData({ switch_show: '' })
    }
  })
}

//发送验证码
function sendVerify(mobile, code) {
  var fullMobile = common.validReg('mobile', mobile);
    if (!fullMobile) {
      var sets = {};
      sets.focusName = false;
      sets.focusMobile = true;
      objPage.setData(sets);
      return false;
    }

  var url = CFG.USERDCAR_APP_API_HOST + 'Common/captcha';
  common.httpRequest(
    url,{
      loading: false,
    data: {
      sendType: code,
      useType: 20,
      username: mobile
    },
    success: function (res) {
      var statusCode = res.statusCode;
      var info = res.data;
      if (200 == statusCode && undefined !== info) {
        if(info.code == '0') {
          common.msg(info.message);
        }
      } else {
        common.msg('no captcha');
      }
    }
  })
}

Page({
  data: {
    detailInfo: '',
    detailButtonInfo: '',
    switch_show: '',
    mobile: null,
    time: null,
    tip_no: 'not_show',
    ul_open_look: '',
    ul_open_system: '',
    ul_open_drive: '',
    ul_open_conf: '',
    ul_open_engine: '',
    ul_open_carb: '',
    ul_open_save: '',
    tip: null,
    focusName: false,
    focusMobile: false,
    serviceStatus: null,
    current:0,
    imgLength:''
  },
  onLoad: function (opt) {
    // 页面初始化 options为页面跳转所带来的参数
    objPage = this;

    //清除特色服务计算的价格
    wx.setStorage({
      key: "new_car_info",
      data: ''
    })
    wx.setStorageSync('item_instalment', null);
    wx.setStorageSync('item_qa', null);
    car_source_no = opt.car_source_no;
  },
  onCall: function (e) {
    common.onCall(e);
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    //买车详情车源号
    if(car_source_no) {
      getBuyCarDetail(car_source_no);
    }
  },
  onPullDownRefresh:function(){
    wx.stopPullDownRefresh()
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
    wx.setStorage({
      key: "car_img_list",
      data: null
    })

    // 清除分期购车
    wx.setStorage({
      key: "item_instalment",
      data: null
    })

    //清除恒信质保
    wx.setStorage({
      key: "item_qa",
      data: null
    })
  },
  //外观内饰图片上一个
  onClickPrev: function (e) {
    if(this.data.current>0){
      this.setData({ current: this.data.current-1 })
    }
  },
  //外观内饰图片下一个
  onClickNext: function (e) {
    if(this.data.current<this.data.imgLength-1){
      this.setData({ current: this.data.current+1 })
    }
  },
  onClickChoose: function (e) {
    this.setData({ switch_show: 'open' })
  },
  onClickClose: function (e) {
    this.setData({ switch_show: '' })
  },
  onClickNo: function (e) {
    var tip = e.currentTarget.dataset.tip;
    if(tip) {
      this.setData({tip : tip});
    this.setData({ tip_no: '' })
    }
  },
  onClickHide: function (e) {
    this.setData({ tip_no: 'not_show' })
  },
  onSendVerify: function (opt) {
    //发送验证码
    var sendtype = opt.currentTarget.dataset.sendtype;
    var username = this.data.mobile;
    sendVerify(username, sendtype);
  },
  mobileBlur: function (e) {
    //设置输入的手机号
    this.setData({ mobile: e.detail.value })
  },
  bindTimeChange: function (e) {
    //预约时间
    this.setData({
      time: e.detail.value
    })
  },
  //显示隐藏
  ul_show: function (e) {
    var fType = e.currentTarget.dataset.filterType;
    switch (fType) {
      case 'look':
        if (this.data.ul_open_look == 'open') {
          this.setData({
            ul_open_look: '',
            ul_open_system: '',
            ul_open_drive: '',
            ul_open_conf: '',
            ul_open_engine: '',
            ul_open_carb: '',
            ul_open_save: ''
          });
        } else {
          this.setData({
            ul_open_look: 'open',
            ul_open_system: '',
            ul_open_drive: '',
            ul_open_conf: '',
            ul_open_engine: '',
            ul_open_carb: '',
            ul_open_save: ''
          });
        }
        break;
      case 'system':
        if (this.data.ul_open_system == 'open') {
          this.setData({
            ul_open_look: '',
            ul_open_system: '',
            ul_open_drive: '',
            ul_open_conf: '',
            ul_open_engine: '',
            ul_open_carb: '',
            ul_open_save: ''
          });
        } else {
          this.setData({
            ul_open_look: '',
            ul_open_system: 'open',
            ul_open_drive: '',
            ul_open_conf: '',
            ul_open_engine: '',
            ul_open_carb: '',
            ul_open_save: ''
          });
        }
        break;
      case 'drive':
        if (this.data.ul_open_drive == 'open') {
          this.setData({
            ul_open_look: '',
            ul_open_system: '',
            ul_open_drive: '',
            ul_open_conf: '',
            ul_open_engine: '',
            ul_open_carb: '',
            ul_open_save: ''
          });
        } else {
          this.setData({
            ul_open_look: '',
            ul_open_system: '',
            ul_open_drive: 'open',
            ul_open_conf: '',
            ul_open_engine: '',
            ul_open_carb: '',
            ul_open_save: ''
          });
        }
        break;
      case 'conf':
        if (this.data.ul_open_conf == 'open') {
          this.setData({
            ul_open_look: '',
            ul_open_system: '',
            ul_open_drive: '',
            ul_open_conf: '',
            ul_open_engine: '',
            ul_open_carb: '',
            ul_open_save: ''
          });
        } else {
          this.setData({
            ul_open_look: '',
            ul_open_system: '',
            ul_open_drive: '',
            ul_open_conf: 'open',
            ul_open_engine: '',
            ul_open_carb: '',
            ul_open_save: ''
          });
        }
        break;
        case 'engine':
        if (this.data.ul_open_engine == 'open') {
          this.setData({
            ul_open_look: '',
            ul_open_system: '',
            ul_open_drive: '',
            ul_open_conf: '',
            ul_open_engine: '',
            ul_open_carb: '',
            ul_open_save: ''
          });
        } else {
          this.setData({
            ul_open_look: '',
            ul_open_system: '',
            ul_open_drive: '',
            ul_open_conf: '',
            ul_open_engine: 'open',
            ul_open_carb: '',
            ul_open_save: ''
          });
        }
        break;
        case 'carb':
        if (this.data.ul_open_carb == 'open') {
          this.setData({
            ul_open_look: '',
            ul_open_system: '',
            ul_open_drive: '',
            ul_open_conf: '',
            ul_open_engine: '',
            ul_open_carb: '',
            ul_open_save: ''
          });
        } else {
          this.setData({
            ul_open_look: '',
            ul_open_system: '',
            ul_open_drive: '',
            ul_open_conf: '',
            ul_open_engine: '',
            ul_open_carb: 'open',
            ul_open_save: ''
          });
        }
        break;
        case 'save':
        if (this.data.ul_open_save == 'open') {
          this.setData({
            ul_open_look: '',
            ul_open_system: '',
            ul_open_drive: '',
            ul_open_conf: '',
            ul_open_engine: '',
            ul_open_carb: '',
            ul_open_save: ''
          });
        } else {
          this.setData({
            ul_open_look: '',
            ul_open_system: '',
            ul_open_drive: '',
            ul_open_conf: '',
            ul_open_engine: '',
            ul_open_carb: '',
            ul_open_save: 'open'
          });
        }
        break;
    }
  },
  onSubmit: function (opt) {
    //提交预约看车
    subscribeCar(opt.detail.value);
  }
})