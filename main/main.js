const database = require('../main/datbase');
var spiltarr = function (arr) {
    var barcodeArr = [];

    barcodeArr = arr.reduce(function (array, value) {

        var elem = array.find(function (e) {
          return e.barcode == value
        })
        if (elem) {
            elem.count++
        } else {
            if(value.indexOf('-')==-1) {
                array.push({'barcode': value, 'count': 1})
            }else{
                var temp = value.split('-');
                array.push({'barcode': temp[0], 'count': temp[1]})
            }
        }
        return array;
    }, []);

    return barcodeArr;
};

var shoppingItemList = function (barCodeList, items) {
    var itemArray = [];
    for (var i = 0; i < barCodeList.length; i++) {
        var itemInfo = items.find(function (value) {
            return value.barcode == barCodeList[i].barcode;
        });
        itemArray.push({
            'barcode': itemInfo.barcode,
            'name': itemInfo.name,
            'count': barCodeList[i].count,
            'unit': itemInfo.unit,
            'price': itemInfo.price,
            'totalPrice': itemInfo.price * barCodeList[i].count,
            'budget':0
        })

    }

    return itemArray;
};

var calBudget = function (shoppingItemArr, promotions) {

    var promoteItem = promotions[0].barcodes;
    var budgetArr = [];

    budgetArr = shoppingItemArr.filter(function (value) {
        if(promoteItem.indexOf(value.barcode) !== -1 && value.count > 1){
        value.budget = value.price;}
        return (promoteItem.indexOf(value.barcode) !== -1 && value.count > 1);

    });
    budgetArr.forEach(function (value) {
        value.budget = value.price
    });


    return budgetArr;
};

var calFooting = function (shoppingItemArr, budgetArr) {
    var totalPrice = 0, totalBudget = 0, footing;
    totalPrice = shoppingItemArr.reduce(function (totalPrice, value) {
        return totalPrice + value.totalPrice;
    }, totalPrice);

    totalBudget = budgetArr.reduce(function (totalBudget, value) {
        return totalBudget + value.budget;
    }, totalBudget);

    footing = {
        'totalBudget': totalBudget,
        'totalPrice': totalPrice,
        'finnalPrice': (totalPrice - totalBudget).toFixed(2)
    };

    return footing;
};

var geneInventoryStr = function (shoppingItemArr, budgetArr, footing) {
    var listStr = '', budgetStr = '', totalStr = '', InventoryStr = '';
    shoppingItemArr.forEach(function (value) {
        listStr = listStr + '名称：' + value.name + '，数量：' + value.count + value.unit + '，单价：' + (value.price).toFixed(2) +'(元)'+ '，小计：' + (value.totalPrice-value.budget).toFixed(2) + '(元)\n';
    });

    budgetArr.forEach(function (value) {
        budgetStr = budgetStr + '名称：' + value.name + '，数量：' + 1 + value.unit + '\n';
    });

    totalStr = '总计：' + footing.finnalPrice + '(元)\n' + '节省：' + footing.totalBudget.toFixed(2) + '(元)\n';


    return '***\<\没钱赚商店\>\购物清单***\n' + listStr + '----------------------\n'+'挥泪赠送商品：\n' + budgetStr + '----------------------\n' + totalStr + '**********************';

};

module.exports = function main(barCodeList) {
    var co = database.loadAllItems(),
        promotions = database.loadPromotions();

    var barcodeArr, shoppingItemArr, budgetArr, footing, InventoryStr;

    barcodeArr = spiltarr(barCodeList);

    shoppingItemArr = shoppingItemList(barcodeArr, items);


    budgetArr = calBudget(shoppingItemArr, promotions);

    footing = calFooting(shoppingItemArr, budgetArr);

    InventoryStr = geneInventoryStr(shoppingItemArr, budgetArr, footing);

    console.log(InventoryStr)
    return InventoryStr;
};
