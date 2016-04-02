/*!
 * TreasureMap
 *
 * @author: Serifx <Serifx@outlook.com>
 * @version: 1.0.0
 * @update: 2016/4/2
 * @reference: http://www.alloyteam.com/2016/03/image-steganography/
 *
 * Copyright (c) 2016 Serifx
 * Licensed under the MIT license
 */

;((function (window) {
  var support = {
    canvas: function () {
      return !!document.createElement('canvas').getContext;
    }
  };

  if(!support.canvas()){
    document.body.insertBefore(document.createTextNode('您的浏览器不支持图像加密显示！'), document.body.firstChild);
    return;
  }

  var $$ = function(selector){
    return document.querySelector(selector);
  };

  var decryptData = function (originalData) {
    var data = originalData.data;
    for (var i = 0, l = data.length; i < l; i += 1) {
      if (i % 4 === 0) { // R通道
        if (data[i] % 2 === 0) {
          data[i] = 0;
        }
        else {
          data[i] = 255;
        }
      } else if (i % 4 === 3) { // Alpha通道
        continue;
      } else {
        // 关闭其他分量，不关闭也不影响，甚至更美观
        data[i] = 0;
      }
    }

    // 绘制到画布
    //ctx.putImageData(originalData, 0, 0);
    return originalData;
  };
  var encryptData = function (originalData, newData, color) {
    var bit, offset;
    switch (color) {
      case 'R':
        bit = 0;
        offset = 3;
        break;
      case 'G':
        bit = 1;
        offset = 2;
        break;
      case 'B':
        bit = 2;
        offset = 1;
        break;
    }

    var oldData = originalData.data;
    var _newData = newData.data;
    for (var i = 0, l = oldData.length; i < l; i += 1) {
      if(i % 4 === bit){
        // 只处理目标通道
        if(_newData[i + offset] === 0 && (oldData[i] % 2 === 1)){
          // 没有信息的像素，该通道最低位置为 0，但不要越界
          oldData[i] === 255 ? (oldData[i]--) : (oldData[i]++);

        } else if (_newData[i + offset] !== 0 && (oldData[i] % 2 === 0)){
          // 有信息的像素，该通道最低位置为 1，可以想想上面的斑点效果是怎么实现的
          oldData[i] === 255 ? (oldData[i]--) : (oldData[i]++);
        }
      }
    }

    //ctx.putImageData(originalData, 0, 0);
    return originalData;
  };

  var drawData = function(callback){
    var data = $$('#data');
    var map = $$('#map');
    var dataCtx = data.getContext('2d');
    data.width = map.width;
    data.height = map.height;
    dataCtx.font = 'italic ' + $$('#font-size').value + 'px Consolas';
    data.textAlign = 'right';
    dataCtx.fillStyle = $$('#color').value;
    dataCtx.textBaseline = 'top';
    dataCtx.fillText($$('#text').value, 20, 20);
    //txtData = dataCtx.getImageData(0,0, dataCtx.canvas.width, dataCtx.canvas.height);

    callback && callback(dataCtx);
  };

  var loadImg = function (imageSrc, canvas, callback) {
    var img = new Image();
    var ctx = canvas.getContext('2d');
    img.onload = function () {
      ctx.canvas.width = img.width;
      ctx.canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      callback && callback(ctx);
    };
    img.src = imageSrc;
  };
  var loadFile = function(control, callback){
    var URL = window.URL || window.webkitURL;
    var blobURL;

    var files = control.files;
    var file;
    if(files && files.length){
      file = files[0];

      var imgFormat = new RegExp('^image\/jpg|jpeg|png$', 'i');
      if(imgFormat.test(file.type)){
        blobURL = URL.createObjectURL(file);

        callback && callback(blobURL);
      } else {
        this.value = '';
        alert('请选择正确的图像文件！');
      }
    }
  };

  // 两组待处理数据
  var srcData;
  var curData;

  /* 加密
   ========================================================================== */
  $$('#btn-addData').onclick = function(){
    drawData(function (context) {
      curData = context.getImageData(0,0, context.canvas.width, context.canvas.height);
    });
    return false;
  };

  $$('#file').onchange = function(){
    loadFile(this, function(blobURL){
      loadImg(blobURL, $$('#map'), function(context){
        srcData = context.getImageData(0,0, context.canvas.width, context.canvas.height);
      });
    });
  };

  $$('#btn-save').onclick = function(){
    if(!$$('#file').value){
      alert('请先选择加密图片！');
      return;
    }

    var data = encryptData(srcData, curData, 'R');

    var _map = document.createElement('canvas');
    _map.width = data.width;
    _map.height = data.height;
    _ctx = _map.getContext('2d');
    _ctx.putImageData(data, 0, 0);

    this.setAttribute('download', 'encrypted.png');
    this.setAttribute('href', _map.toDataURL());

    _map = null;
  };

  /* 解密
   ========================================================================== */
  $$('#file2').onchange = function(){
    loadFile(this, function(blobURL){
      loadImg(blobURL, $$('#map2'), function(context){
        srcData = context.getImageData(0,0, context.canvas.width, context.canvas.height);
      });
    });
  };

  $$('#btn-decrypt').onclick = function() {
    if (!$$('#file2').value) {
      alert('请先选择解密图片！');
      return;
    }

    var data = decryptData(srcData);

    $$('#map2').getContext('2d').putImageData(data, 0, 0);
  };

})(window));
