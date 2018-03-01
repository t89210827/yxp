// pages/shop-cart/shop-cart.js
var app = getApp()
var util = require('../../utils/util.js')
var vm = null
// var list = [
//   {
//     "goodsId": 12316,
//     "pic": "https://cdn.it120.cc/apifactory/2017/11/27/1a7732cbf3980876238753939fc35b33.jpg",
//     "name": "御泥坊男士黑茶清爽控油矿物泥浆面膜去黑头祛痘收缩毛孔补水新品",
//     "propertyChildIds": "",
//     "label": "",
//     "price": 2323,
//     "left": "",
//     "active": true,
//     "number": 1,
//     "logisticsType": 0,
//     "weight": 234
//   }
// ]
Page({
  data: {
    goodsList: {
      saveHidden: true,   //控制删除还是结算
      totalPrice: 0,      //总价格
      allSelect: true,    //是否全选
      noSelect: false,    //是否显示底部框架
      list: []            //购物车商品列表
    },
    delBtnWidth: 120,    //删除按钮宽度单位（rpx）
  },
  //获取元素自适应后的实际宽度
  getEleWidth: function (w) {
    var real = 0;
    try {
      var res = wx.getSystemInfoSync().windowWidth;
      var scale = (750 / 2) / (w / 2);  //以宽度750px设计稿做宽度的自适应
      // console.log(scale);
      real = Math.floor(res / scale);
      return real;
    } catch (e) {
      return false;
      // Do something when catch error
    }
  },
  initEleWidth: function () {
    var delBtnWidth = this.getEleWidth(this.data.delBtnWidth);
    this.setData({
      delBtnWidth: delBtnWidth
    });
  },
  onLoad: function () {
    vm = this
    this.initEleWidth();
    this.onShow();
  },

  //根据id获取购物车数据
  getShoppingCart: function () {
    util.getShoppingCart({}, function (res) {
      console.log("根据id获取购物车数据 ： " + JSON.stringify(res))
      var goodsList = vm.data.goodsList
      var shoppingCart = res.data.ret.shoppingCart
      for (var i = 0; i < shoppingCart.length; i++) {
        shoppingCart[i].active = false
      }
      vm.setData({
        'goodsList.list': shoppingCart
      })
      // console.log("根据id获取购物车数据1 ： " + JSON.stringify(vm.data.goodsList.list))
    })
  },

  onShow: function () {
    this.getShoppingCart();
    var shopList = [];
    // 获取购物车数据
    // var shopCarInfoMem = wx.getStorageSync('shopCarInfo');
    // if (shopCarInfoMem && shopCarInfoMem.shopList) {
    //   shopList = shopCarInfoMem.shopList
    //   console.log("购物车数据" + JSON.stringify(shopList))
    // }
    // this.data.goodsList.list = shopList;
    // this.data.goodsList.list = list;   用本地购物车数据
    // this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), shopList);
    this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), vm.data.goodsList.list);
  },
  //购物城没数据时点击跳转
  toIndexPage: function () {
    wx.switchTab({
      url: "/pages/index/index/index"
    });
  },

  touchS: function (e) {
    if (e.touches.length == 1) {
      this.setData({
        startX: e.touches[0].clientX
      });
    }
  },
  touchM: function (e) {
    var index = e.currentTarget.dataset.index;

    if (e.touches.length == 1) {
      var moveX = e.touches[0].clientX;
      var disX = this.data.startX - moveX;
      var delBtnWidth = this.data.delBtnWidth;
      var left = "";
      if (disX == 0 || disX < 0) {//如果移动距离小于等于0，container位置不变
        left = "margin-left:0px";
      } else if (disX > 0) {//移动距离大于0，container left值等于手指移动距离
        left = "margin-left:-" + disX + "px";
        if (disX >= delBtnWidth) {
          left = "left:-" + delBtnWidth + "px";
        }
      }
      var list = this.data.goodsList.list;
      if (index != "" && index != null) {
        list[parseInt(index)].left = left;
        this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
      }
    }
  },

  touchE: function (e) {
    var index = e.currentTarget.dataset.index;
    if (e.changedTouches.length == 1) {
      var endX = e.changedTouches[0].clientX;
      var disX = this.data.startX - endX;
      var delBtnWidth = this.data.delBtnWidth;
      //如果距离小于删除按钮的1/2，不显示删除按钮
      var left = disX > delBtnWidth / 2 ? "margin-left:-" + delBtnWidth + "px" : "margin-left:0px";
      var list = this.data.goodsList.list;
      if (index !== "" && index != null) {
        list[parseInt(index)].left = left;
        this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);

      }
    }
  },
  //删除一个商品
  delItem: function (e) {
    // console.log("删除 ： " + JSON.stringify(e))
    var deleid = e.currentTarget.dataset.deleid;
    console.log("1" + JSON.stringify(list))
    var id = []
    id.push(deleid)
    var param = {
      id: id
    }
    util.deletedShoppingCart(param, function (res) {
      console.log("删除 ： " + JSON.stringify(res))
    })

    var index = e.currentTarget.dataset.index;
    var list = this.data.goodsList.list;
    list.splice(index, 1);
    this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
  },
  //点击一个商品
  selectTap: function (e) {
    var index = e.currentTarget.dataset.index;
    var list = this.data.goodsList.list;
    if (index !== "" && index != null) {
      list[parseInt(index)].active = !list[parseInt(index)].active;
      this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
    }
  },
  //获取总价格
  totalPrice: function () {
    var list = this.data.goodsList.list;
    var total = 0;
    console.log("list ： " + JSON.stringify(list));
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      if (curItem.active) {
        if (curItem.number == null) {
          total += parseFloat(curItem.goods_id.price);
        } else {
          total += parseFloat(curItem.goods_id.price) * curItem.number;
        }
        // console.log("总价格 ： " + curItem.goods_id.price)
        console.log("总价格 ： " + total)
      }
    }
    total = parseFloat(total.toFixed(2));//js浮点计算bug，取两位小数精度
    return total;
  },
  //点击全选按钮
  allSelect: function () {
    var list = this.data.goodsList.list;
    var allSelect = false;
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      if (curItem.active) {
        allSelect = true;
      } else {
        allSelect = false;
        break;
      }
    }
    return allSelect;
  },
  //是否出现框架
  noSelect: function () {
    var list = this.data.goodsList.list;
    var noSelect = 0;
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      if (!curItem.active) {
        noSelect++;
      }
    }
    if (noSelect == list.length) {
      return true;
    } else {
      return false;
    }
  },
  //设置商品信息
  setGoodsList: function (saveHidden, total, allSelect, noSelect, list) {
    this.setData({
      goodsList: {
        saveHidden: saveHidden,
        totalPrice: total,
        allSelect: allSelect,
        noSelect: noSelect,
        list: list
      }
    });
    // var shopCarInfo = {};
    // var tempNumber = 0;
    // shopCarInfo.shopList = list;
    // for (var i = 0; i < list.length; i++) {
    //   tempNumber = tempNumber + list[i].number
    // }
    // shopCarInfo.shopNum = tempNumber;
    // wx.setStorage({
    //   key: "shopCarInfo",
    //   data: shopCarInfo
    // })
  },
  //点击全选
  bindAllSelect: function () {
    var currentAllSelect = this.data.goodsList.allSelect;
    var list = this.data.goodsList.list;
    if (currentAllSelect) {
      for (var i = 0; i < list.length; i++) {
        var curItem = list[i];
        curItem.active = false;
      }
    } else {
      for (var i = 0; i < list.length; i++) {
        var curItem = list[i];
        curItem.active = true;
      }
    }

    this.setGoodsList(this.getSaveHide(), this.totalPrice(), !currentAllSelect, this.noSelect(), list);
  },
  jiaBtnTap: function (e) {
    var index = e.currentTarget.dataset.index;
    var list = this.data.goodsList.list;
    if (index !== "" && index != null) {
      if (list[parseInt(index)].number < 10) {
        list[parseInt(index)].number++;
        this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
      }
    }
  },
  //点击减号
  jianBtnTap: function (e) {
    var index = e.currentTarget.dataset.index;
    var list = this.data.goodsList.list;
    if (index !== "" && index != null) {
      if (list[parseInt(index)].number > 1) {
        list[parseInt(index)].number--;
        this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
      }
    }
  },
  //点击编辑
  editTap: function () {
    var list = this.data.goodsList.list;
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      curItem.active = false;
    }
    this.setGoodsList(!this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
  },
  //点击完成
  saveTap: function () {
    var list = this.data.goodsList.list;
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      curItem.active = true;
    }
    this.setGoodsList(!this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
  },
  getSaveHide: function () {
    var saveHidden = this.data.goodsList.saveHidden;
    return saveHidden;
  },
  //点击删除
  deleteSelected: function () {
    var list = this.data.goodsList.list
    console.log("1" + JSON.stringify(list))
    var id = []
    for (var i = 0; i < list.length; i++) {
      console.log("2" + list[i].active)
      if (list[i].active) {
        id.push(list[i].id)
      }
    }
    var param = {
      id: id
    }
    util.deletedShoppingCart(param, function (res) {
      console.log("删除 ： " + JSON.stringify(res))
    })

    // var list = this.data.goodsList.list;
    list = list.filter(function (curGoods) {
      return !curGoods.active;
    });
    this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
  },
  //去结算
  toPayOrder: function () {
    var goodsList = this.data.goodsList
    var list = goodsList.list
    var Alltotal_fee = goodsList.totalPrice //总金额  
    var goods_list = [] //数组形式的商品列表
    for (var i = 0; i < list.length; i++) {
      var total_fee = 0
      if (list[i].active) {
        if (list.number == null) {
          total_fee = parseFloat(list[i].goods_id.price);
        } else {
          total_fee = parseFloat(list[i].goods_id.price) * list[i].number;
        }
        var goods = {
          goods_id: list[i].goods_id.id,
          count: list[i].number,
          total_fee: total_fee
        }
        goods_list.push(goods)
      }
    }

    var param = {
      total_fee: Alltotal_fee,
      address_id: 1,
      invoice_id: 1,
      goods: goods_list
    }
    util.payOrder(param, function (res) {
      console.log("支付成功回掉" + JSON.stringify(res))
      wx.requestPayment({
        timeStamp: res.data.ret.timeStamp,
        nonceStr: res.data.ret.nonceStr,
        package: res.data.ret.package,
        signType: res.data.ret.signType,
        paySign: res.data.ret.paySign,
      })
    })
  },
  navigateToPayOrder: function () {
    wx.hideLoading();
    wx.navigateTo({
      url: "/pages/to-pay-order/index"
    })
  }

})
