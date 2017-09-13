var common = require('../../../utils/util.js')
var CFG = require('../../../utils/config.js')
var objPage = null;

//获取应用实例
var app = getApp();

// 获取首页banner图
function getBanner() {
    var url = CFG.APP_API_HOST + '/Info/V2/Index';
    common.httpRequest(url, {
        loading: false,
        data: { count: 1, page: 1 },
        success: function (res) {
            var statusCode = res.statusCode;
            var info = res.data;
            if (200 == statusCode && undefined !== info.banner) {
                objPage.setData({ banners: info.banner });
            }
        }
    })
}

function refreshInfoList() {
    var that = objPage;
    if (that.data.newsEnd) {
        return;
    }
    var tick = that.data.newsIndex + 1;
    that.setData({ newsIndex: tick });
    var url = CFG.APP_API_HOST + 'Info/V2/Index/guideInfo';
    common.httpRequest(url, {
        pageLoading: true,
        data: { count: 10, page: tick, guideCode: that.data.newsType },
        success: function (res) {
            var statusCode = res.statusCode;
            var infoList = res.data;
            var currentCache = [];
            currentCache = that.data.newsList;
            if (200 == statusCode && infoList.length) {
                for (var i in infoList) {
                    var r = infoList[i];
                    var date = r.date;
                    date = common.formatDate(date, 'MM月d日');

                    // imageList
                    var pageType = r.pageType;//10=单图，20=多图
                    var imgList = r.thumbImage;

                    // 标签
                    var tags = infoList[i]['tags'];
                    var tagList = [];
                    var tagTxt = '';
                    if (tags.length) {
                        for (var j in tags) {
                            tagList.push(tags[j]['tagName']);
                        }
                        tagTxt = tagList.join(' ');
                    }

                    // infoID
                    var infoID = r.infoID;
                    currentCache.push({ infoID: infoID, img: r.thumbImage[0], title: r.title, date: date, pageType: pageType, imgList: imgList, tagTxt: tagTxt });
                }
                that.setData({ newsList: currentCache });
            } else {
                // 标识最后一页
                that.setData({ newsEnd: true });
            }
        }
    });
}

Page({
    data: {
        newsType: 1,
        linkColors: {
            1: "on vi_a",
            10: "vi_a",
            20: "vi_a",
            30: "vi_a"
        },
        banners: [],
        newsEnd: false,
        newsIndex: 0,
        newsList: [],
        indicatorDots: false,
        autoplay: true,
        interval: 3000,
        duration: 500
    },
    onLoad: function (option) {
        objPage = this;
        var newsType = option.type;
        if (undefined !== newsType) {
            var colors = this.data.linkColors;
            for (var i in colors) {
                if (newsType == i) {
                    colors[i] = 'on vi_a';
                } else {
                    colors[i] = 'vi_a';
                }
            }
            // 1. 设置颜色
            this.setData({ linkColors: colors });

            this.setData({ newsType: newsType, newsIndex: 0, newsEnd: false, newsList: [] });// 初始化操作
        }

        getBanner();
        refreshInfoList(this);
    },
    onWaterFall: function () {
        refreshInfoList(this);
    },
    onPullDownRefresh: function (e) {
    getBanner();

    var init = {}
    init.newsEnd=false;
    init.newsIndex=0;
    init.newsList=[];
    this.setData(init);
    refreshInfoList()

    wx.stopPullDownRefresh();
    },
    // 导航链接点击事件
    onNavClick: function (e) {
        var id = e.target.id;
        var newsType = id.replace(/type_/, '');
        var colors = this.data.linkColors;
        for (var i in colors) {
            if (newsType == i) {
                colors[i] = 'on vi_a';
            } else {
                colors[i] = 'vi_a';
            }
        }
        // 1. 设置颜色
        this.setData({ linkColors: colors });

        this.setData({ newsType: newsType, newsIndex: 0, newsEnd: false, newsList: [] });// 初始化操作
        // 2. 发送请求
        refreshInfoList(this);
    },
    onClickBanner: function (e) {
        var form = e.currentTarget.dataset;
        var source = form.source;
        var id = form.infoId;
        if (10 == source) {
            wx.navigateTo({
                url: '/pages/info/index/detail?id=' + id
            })
        } else if (20 == source) {
            wx.navigateTo({
                url: '/pages/shop/news/detail?promotionid=' + id
            })
        } else {
            common.msg('敬请期待 :)');
        }

    }

})
