var common = require('../../../utils/util.js')
var CFG = require('../../../utils/config.js')
var objPage = null;
function getNewsDetail(id) {
    var url = CFG.APP_API_HOST + '/Info/V2/Index/detail';
    common.httpRequest(url,{
        pageLoading:true,
        data: {infoID:id},
        success: function (res) {
            var statusCode = res.statusCode;
            var detailInfo = {};
            var info = res.data;
            if (200 == statusCode && undefined !== info.title) {
            	info.pageType = parseInt(info.pageType);
                detailInfo.title = info.title;                      //标题
                objPage.setData({ title: info.title });             //分享标题
                detailInfo.sourceForm = info.sourceForm;            //作者
                detailInfo.date = info.date;                        //发布日期
                detailInfo.wxml_body = info.wxml_body;              //正文
                objPage.setData({ content_slice: info.wxml_body });

                //相关文章推荐列表
                var box = [];
                for (var i in info.relevant) {
                    var r = info.relevant[i];
                    box[i] = { introduction: r.introduction,title:r.title, infoID: r.infoID, pageType: r.pageType };
                }
                detailInfo.relevantList = box;

                //车型详情列表
                box = [];
                for (var i in info.data) {
                    var r = info.data[i];
                    box[i] = {
                        brandName: r.brandName, seriesName: r.seriesName, extID: r.extID, thumb: r.thumb,
                        itemOrigPrice: r.itemOrigPrice
                    };
                }
                detailInfo.modelDataList = box;
                detailInfo.images = info.images;
                detailInfo.pageType = info.pageType;
                //价格修改
                for(i in detailInfo.modelDataList){
                    var index = detailInfo.modelDataList[i];
                    index.itemOrigPrice = common.formatMoney(index.itemOrigPrice);
                }
                objPage.setData({ detailInfo: detailInfo });
            }
        }
    })
}

Page({
    data: {
        content_slice: [],
        id: '',
        title: ''
    },
    onLoad: function (opt) {
        objPage = this;
        var id = opt.id;
        this.setData({ id: id });
        getNewsDetail(id);
    },
    onShareAppMessage: function (res) {
        var share = {
            title: this.data.title,
            desc: CFG.SHARE_DESC,
            path: '/pages/info/index/detail?id=' + this.data.id
        };
        return share;
    },
    goTo:function(e){
        var q = e.currentTarget.dataset.query;
        common.goTo('NEWCAR_DETAIL',q);
    },
    onPullDownRefresh:function(){
        getNewsDetail(this.data.id)
        wx.stopPullDownRefresh()
    }
})
