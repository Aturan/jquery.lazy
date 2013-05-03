/**
 * jQuery Plugin
 * 目标DOM在指定可视范围内时加载数据
 * DataLazyload: {@link http://docs.kissyui.com/docs/html/api/component/datalazyload/}
 * 成功时会触发loadsuccess事件，失败会触发loaderror事件
 * $.lazy会返回Promise，以实现回调
 * (基于一致性，$.fn.lazy不返回Promise，不提供回调)
 * $.fn.lazy提供了简单的延迟加载图片、HTML的能力
 */
(function($) {
  "use strict";
	$.lazy = function() {

	};

	$.fn.lazy = function() {

	}



})(jQuery);

define(function (require, exports, module) {
	"use strict";

	var $ = require('$');
	var _ = require('_');


	var adjustPosition = {
		stretchCenter: function(image, container) {
			var posType = ['relative', 'absolute', 'fixed'];
			if (_.indexOf(posType, container.css('position')) == -1) {
				container.css('position', 'relative');
			}

			var wrapSize = [container.width(), container.height()];
			var imgSize = [image.width(), image.height()];

			if (imgSize[0]/wrapSize[0] > imgSize[1]/wrapSize[1]) {
				image.height(wrapSize[1]);
				imgSize[0] = image.width();
				imgSize[1] = wrapSize[1];
			}
			else {
				image.width(wrapSize[0]);
				imgSize[0] = wrapSize[0];
				imgSize[1] = image.height();
			}

			image.css('position', 'absolute');
			image.css('left', (wrapSize[0] - imgSize[0])/2);
			image.css('top', (wrapSize[1] - imgSize[1])/2);
		}
	};

	exports.POSITION_STRETCH_CENTER = 'stretchCenter';


	/**
	 * 对图片位置进行调整，
	 * @param {jQuery} element img元素对象
	 * @param {String} positionType 要使用的位置类型
	 * @param {jQuery} [container] 图片容器元素，默认使用image.parent
	 */
	exports.adjustPosition = function(element, positionType, container) {
		container || (container = element.parent());
		adjustPosition[positionType](element, container);
	};


	//等待lazyLoad的image对象列表
	var lazyLoadList = [];
	//默认添加到的列表标签
	var DEFAULT_LIST_LABEL = 'default';

	//初始化lazyLoad，只执行一次
	function initLazyLoad() {
		initLazyLoad.inited = true;
		$(window).on('scroll.moImage', _.throttle(scrollHandle, 100));
		$(window).on('scroll.moImage', _.throttle(updateOffset, 1000));
	}

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
	 * @return {Object}
	 */
	function getCurrentArea() {
		var _window = $(window);
		var top = _window.scrollTop();
		return {
			top: top - 150,
			bottom: top + _window.height() + 200
		};
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
