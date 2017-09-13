// 日期侧滑插件：2017-01-18 Wed 15:33:35 by PHPJungle
// 更新记录1：2017-02-07 Tue 15:07:41 添加对区(县)的支持，默认不显示县，当在page对象中添加配置:page.data.showCounty=true时显示县
var common = require('../util.js');
function init(page) {
    if (!page.data) {
        page.data = {};
    }

    // 是否显示县县(区),默认不显示
    if(undefined === page.data.showCounty){
        page.data.showCounty = false;
    }

    // 日期配置
    var sliderConfig = {};
    sliderConfig.showCounty = page.data.showCounty;
    sliderConfig.value = ''; //'湖北省武汉市'
    sliderConfig.provinceIndex = 11;
    sliderConfig.cityIndex = 0;
    sliderConfig.countyIndex = 0;
    sliderConfig.provinces = common.getProvinces();
    sliderConfig.citys = common.getCitys(sliderConfig.provinces[sliderConfig.provinceIndex].id);

    var provinceID = sliderConfig.provinces[sliderConfig.provinceIndex].id;
    var provinceName = sliderConfig.provinces[sliderConfig.provinceIndex].name;
    var cityID = sliderConfig.citys[sliderConfig.cityIndex].id;
    var cityName = sliderConfig.citys[sliderConfig.cityIndex].name;


    sliderConfig.countys = common.getCountys(provinceID,cityID);
    var countyName = sliderConfig.countys[sliderConfig.countyIndex].name;

    sliderConfig.value = provinceName+cityName+(page.data.showCounty?countyName:'');
    page.data.sliderConfig = {};
    page.setData({ sliderConfig: sliderConfig });

    // 设置省市显示value
    page.setValue = function () {
        var info = this.getCurrentCity();
        var config = this.data.sliderConfig;

        config.value = info.value;
        this.setData({ sliderConfig: config });
    }

    // 蒙版控制
    page.setData({ switch_datePicker: '' });

    // 蒙版事件
    page.hideDatePicker = function () {
        page.setData({ switch_datePicker: '' });
    }

    // 显示事件
    page.showDatePicker = function () {
        page.setData({ switch_datePicker: 'on' });
    }

    // 事件配置
    page.onChangeProvince = function (e) {
        var index = e.detail.value;
        this.data.sliderConfig.provinceIndex = index;

        var provinceID = this.data.sliderConfig.provinces[index].id;
        this.data.sliderConfig.citys = common.getCitys(provinceID);
        this.data.sliderConfig.cityIndex = 0;

        var cityID = this.data.sliderConfig.citys[0].id;
        this.data.sliderConfig.countys = common.getCountys(provinceID,cityID);
        this.data.sliderConfig.countyIndex = 0;


        this.setData({ sliderConfig: this.data.sliderConfig });
        this.setValue();
    };
    page.onChangeCity = function (e) {
        var index = e.detail.value;
        this.data.sliderConfig.cityIndex = index;
        var cityID = this.data.sliderConfig.citys[index].id;

        var provinceIndex = this.data.sliderConfig.provinceIndex ;
        var provinceID = this.data.sliderConfig.provinces[provinceIndex].id;

        this.data.sliderConfig.countys = common.getCountys(provinceID,cityID);
        this.data.sliderConfig.countyIndex = 0;

        this.setData({ sliderConfig: this.data.sliderConfig });
        this.setValue();
    };
    page.onChangeCounty = function(e){
        var index = e.detail.value;

        this.data.sliderConfig.countyIndex = index;
        this.setData({ sliderConfig: this.data.sliderConfig });
        this.setValue();
    };

    // 获取当前下拉框内容
    page.getCurrentCity = function () {
        var config = this.data.sliderConfig;
        var currentProvince = config.provinces[config.provinceIndex];
        var currentCity = config.citys[config.cityIndex];
        var currentCounty = config.countys[config.countyIndex];
        var ret = {};
        ret.provinceID = currentProvince.id;
        ret.provinceName = currentProvince.name;
        ret.cityID = currentCity.id;
        ret.cityName = currentCity.name;
        ret.countyID =  currentCounty.id;
        ret.countyName = currentCounty.name;
        ret.value = ret.provinceName+ret.cityName+(this.data.showCounty?ret.countyName:'');
        return ret;
    };

    // 设置当前被选中的省市县
    page.setCurrentCity = function(prov,city,county){
        const provinces = this.data.sliderConfig.provinces
        if(!provinces.length){
            return ;
        }
        var prov_i = city_i = county_i = null;
        var citys = [];
        var countys = [];
        for(var i in provinces){
           if(prov == provinces[i].name){
             prov_i = i; // 1. set provinceIndex
             break;
           }
        }

        if(null === prov_i) return;
        const dataSet = common.getCacheCitys();
        for(var i in dataSet[prov_i].subAreas){
            var c_name = dataSet[prov_i].subAreas[i].title;
            var c_id = dataSet[prov_i].subAreas[i].areaID;
            citys.push({id:c_id ,name: c_name})
            if(city == c_name){
                city_i = i;
            }
        }
        if(null === city_i) return;
        for(var i in dataSet[prov_i].subAreas[city_i].subAreas){
            var ct_i = dataSet[prov_i].subAreas[city_i].subAreas[i].areaID;
            var ct_name = dataSet[prov_i].subAreas[city_i].subAreas[i].title;
            countys.push({id:ct_i , name:ct_name});
            if(county == ct_name){
                county_i = i;
            }

        }

        if(null === county_i) county_i = 0; 
        const sliderConfig = this.data.sliderConfig;
        sliderConfig.provinceIndex = prov_i;
        sliderConfig.cityIndex = city_i;
        sliderConfig.countyIndex = county_i;
        sliderConfig.citys = citys;
        sliderConfig.countys = countys;

        this.setData({ sliderConfig: sliderConfig });
        this.setValue();
        return;
    };

    function getItemInfo(dict,attr_value){
        var ret = null;
        if(!!dict.lenght){
            ret = {i:0,item:dict['0']};
            for(var i in dict){
                if(attr_value == dict[i].name){
                    ret = {i:i,item:dict[i]};
                }
            }
        }
        return ret;
    }
}

module.exports = {
    init: init
}