/**
 * 参数对象/数据类型对应表：
 * HTMLImageElement: image,
 * url: remote data: html/json/xml, etc.
 * textarea: html
 * script: html
 *
 */
(function($) {
  "use strict";

	var lazyLoadList = [];

	var processor = function() {

	};
	/**
	 * @param {jQuery} $element
	 * @param {Object} [options]
	 * @param {String} options.type 请求资源类型
	 * @param {String|Function} options.res 要请求的资源URL/内容
	 * @param {Object|Number} options.offset 响应区域偏移范围
	 */
	var lazyload = function($element, options) {
		options || (options = {});
		if (options.type === 'image') {

		}
		else if (options.type === 'html') {

		}
		else if (options.type === 'url') {

		}
	};

	var destroyBind = function(element) {

	};

	/**
	 * @param func
	 * @param wait
	 * @param {T} [context]
	 * @returns {Function}
	 */
	var throttle = function(func, wait, context) {
		var result;
		var timeout = null;
		var previous = 0;

		return function() {
			var now = new Date();
			var remaining = wait - (now-previous);
			context || (context = this);
			if (remaining <= 0) {
				clearTimeout(timeout);
				timeout = null;
				previous = now;
				result = func.apply(context, arguments);
			}
			return result;
		};
	};

	/**
	 * @return {Object}
	 */
	var getCurrentArea = function (offsetTop, offsetBottom) {
		var $window = $(window);
		var top = $window.scrollTop();
		return {
			top: top - (offsetTop || 0),
			bottom: top + $window.height() + (offsetBottom || 0)
		};
	};

	//初始化监听
	$(window).on('scroll.__lazy', throttle(processor, 100));


	$.fn.lazy = function(options) {
		if (options === 'destroy') {
			this.each(function() {
				destroyBind(this);
			});
		}
		else {
			this.each(function() {
				lazyload(this, options);
			});
		}
		return this;
	};
})(jQuery);

define(function (require, exports, module) {
	"use strict";

	var $ = require('$');
	var _ = require('_');


	//等待lazyLoad的image对象列表
	var lazyLoadList = [];
	//默认添加到的列表标签
	var DEFAULT_LIST_LABEL = 'default';

	function updateOffset() {
		_.each(lazyLoadList, function(value) {
			value.offset = value.getOffset();
		});
	}

	function scrollHandle() {
		var area = getCurrentArea();
		_.each(lazyLoadList, function(value, key) {
			try {
				var offsetTop = value.offset.top;
				if (offsetTop + value.target.height() > area.top && offsetTop < area.bottom) {
					value.target.removeData('lazyLoad.moConfig');
					_lazyLoadImage(value.target, value);
					lazyLoadList[key] = null;
				}
			}
			catch (e) {
				lazyLoadList[key] = null;
			}
		});
		lazyLoadList = _.compact(lazyLoadList);
	}



	/**
	 * @param {jQuery} image
	 * @param {Object} lazyObj
	 * @private
	 */
	function _lazyLoadImage(image, lazyObj) {
		var src = image.attr(lazyObj['attr']) || '';
		image.attr('src', src).one({
			load: lazyObj.handle.onLoad || $.noop,
			error: lazyObj.handle.onError || $.noop
		});

		var img = image.get(0);
		if (src != null && src != '') {
			if (img.complete || img.readyState === 4) {
				image.trigger('load');
			}
			else if (img.readyState === 'uninitialized' && img.src.indexOf('data:') === 0) {
				image.trigger('error');
			}
		}
		else {
			image.trigger('error');
		}
	}

	/**
	 * LazyLoad的接口
	 * @type {Object}
	 */
	exports.lazyLoad = {
		/**
		 * 添加到lazyload列表
		 * offset当前会将此属性静态化
		 * TODO 添加dynamicOffset属性,动态获取offset
		 *
		 *
		 * @param {jQuery|Element|String} image ImageElement对象或jQuery对象或css选择器
		 * @param {Object} [options]
		 * @param {String} options.label lazyload队列名称
		 * @param {String} options.attr 储存图片地址的属性
		 * @param {Function} options.offset 元素相对于文档的位置(参考jQuery().offset())
		 * @param {Function} options.onLoad 成功失败
		 * @param {Function} options.onError 失败回调
		 */
		add: function(image, options) {
			initLazyLoad.inited || initLazyLoad();
			image = $(image);
			image.each(function() {
				var target = $(this);
				if (target.get(0).tagName.toLowerCase() == 'img') {
					var item = {};
					options || (options = {});
					item.id = _.uniqueId('moImage.lazyLoad:');
					target.data('lazyLoad.moConfig', {id: item.id});
					item.target = target;
					item.label = options.label || DEFAULT_LIST_LABEL;
					item.attr = options.attr || 'data-src';
					if (_.isFunction(options.offset)) {
						item.getOffset = function() {
							return options.offset.call(image[0], image);
						};
					}
					else {
						item.getOffset = function() {
							return target.offset();
						};
					}

					item.offset = item.getOffset();
					item.handle = {onLoad: options.onLoad, onError: options.onError};
					lazyLoadList.push(item);
				}
				else {
					throw new Error('tagName is not "img"');
				}
			});
			setTimeout(function() {
				$(window).trigger('scroll.moImage');
			}, 0);
		},
		/**
		 * 从lazyLoad列表移除一个元素
		 * @param {jQuery} image
		 */
		remove: function(image) {
			var data = image.data('lazyLoad.moConfig');
			if (data) {
				lazyLoadList = _.filter(lazyLoadList, function(value) {
					return value.id != data.id;
				});
			}
		},
		/**
		 * 清除列表
		 * @param {String} [labelName] 标签名，为空则清空列表
		 */
		clear: function(labelName) {
			lazyLoadList = labelName == null ? [] : _.filter(lazyLoadList, function() {
				return this.label == labelName;
			});
		}
	};
});
