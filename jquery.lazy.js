(function($) {
	"use strict";

	var lazyLoadList = [];

	var processor = function() {
		var area = getCurrentArea();

		for (var i = 0; i < lazyLoadList.length; i++) {
			try {
				var item = lazyLoadList[i];
				var $element = item[0];
				var options = item[1];
				var offset = $element.data('offset.lazy');

				if (offset.top + $element.height() > area.top && offset.top < area.bottom) {
					$element.removeData('offset.lazy');
					options.once && (lazyLoadList[i] = null);
					if (options.type == 'image') {
						(function($element, options) {
							setTimeout(function() {
								loadImage($element, options);
							}, 0);
						})($element, options);
					}
					else if (options.type == 'url') {
						(function($element, options) {
							setTimeout(function() {
								loadData($element, options);
							}, 0);
						})($element, options);
					}
					else {
						(function($element, options) {
							setTimeout(function() {
								options.onLoad(options.res($element));
								$(window).trigger('scroll.__lazy');
							}, 0);
						})($element, options);
					}
				}
			}
			catch (e) {

			}
		}

		var iterator = function(array, func) {
			var newArray = [];
			for (var i = 0; i < lazyLoadList.length; i++) {
				if (func(lazyLoadList[i], i, lazyLoadList)) {
					newArray.push(lazyLoadList[i]);
				}
			}
			return newArray;
		};

		lazyLoadList = iterator(lazyLoadList, function(value) {
			return !!value;
		});
	};


	/**
	 * @param {jQuery} $image
	 * @param {Object} options
	 * @private
	 */
	var loadImage = function($image, options) {
		var src = options.res($image);

		$image.one({
			load: function(e) {
				options.onLoad($image, options, e);
				$(window).trigger('scroll.__lazy');
			},
			error: function(e) {
				options.onError($image, options, e);
				$(window).trigger('scroll.__lazy');
			}
		});

		var img = $image.get(0);

		if (src != null && src != '') {
			$image.attr('src', src);
			if (img.complete || img.readyState === 4) {
				$image.trigger('load');
			}
			else if (img.readyState === 'uninitialized' && img.src.indexOf('data:') === 0) {
				$image.trigger('error');
			}
		}
		else {
			$image.trigger('error');
		}
	};

	/**
	 * @private
	 * @param {jQuery} $element
	 * @param {Object} options
	 */
	var loadData = function($element, options) {
		$.ajax(options.res($element))
			.done(function(data) {
				options.onLoad($element, data, options);
			})
			.fail(function(jqXHR) {
				options.onError($element, jqXHR, options);
			})
			.always(function() {
				$(window).trigger('scroll.__lazy');
			});
	};

	var updateOffset = function() {
		for (var i = 0; i < lazyLoadList.length; i++) {
			var item = lazyLoadList[i];
			item && item[0].data('offset.lazy', item[1].offset(item[0]));
		}
	};

	/**
	 * @param {jQuery} $element
	 * @param {Object} options
	 * @param {String} options.type 请求资源类型
	 * @param {Boolean} options.once 是否只执行一次
	 * @param {String} options.onLoad 加载成功回调
	 * @param {String} options.onError 加载失败回调
	 * @param {String|Function} options.res 要请求的资源
	 * @param {Object|Function} [options.offset] 响应区域
	 */
	var lazyload = function($element, options) {
		options || (options = {});
		if (!$.isFunction(options.offset)) {
			if (options.offset) {
				var offset = options.offset;
				options.offset = function() {
					return offset;
				};
			}
			else {
				options.offset = function($element) {
					return $element.offset();
				};
			}
		}

		if (!$.isFunction(options.res)) {
			var res = options.res;
			options.res = function() {
				return res;
			};
		}

		$element.data('offset.lazy', options.offset($element));

		options.onLoad || (options.onLoad = function() {});
		options.onError || (options.onError = function() {});

		if (options.type == 'image') {
			options.once = true;
		}

		lazyLoadList.push([$element, options]);
	};
	/**
	 * @param {jQuery} $element
	 */
	var destroyBind = function($element) {
		for (var i = 0; i < lazyLoadList.length; i++) {
			var item = lazyLoadList[i];
			if (item && item[0].get(0) == $element.get(0)) {
				lazyLoadList.splice(i, 1);
				return;
			}
		}
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
	var getCurrentArea = function () {
		var $window = $(window);
		var top = $window.scrollTop();
		return {
			top: top,
			bottom: top + $window.height()
		};
	};

	//初始化监听
	$(window).on('scroll.__lazy', throttle(updateOffset, 1000));
	$(window).on('scroll.__lazy', throttle(processor, 100));


	$.fn.lazy = function(options) {
		if (options === 'destroy') {
			this.each(function() {
				destroyBind($(this));
			});
		}
		else {
			this.each(function() {
				lazyload($(this), options);
			});
			$(window).trigger('scroll');
		}
		return this;
	};
})(jQuery);
