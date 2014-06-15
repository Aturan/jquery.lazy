var $ = require('jquery');
var lazyLoadList = [];

var processor = function() {
	var area = getCurrentArea();
	for (var i = 0; i < lazyLoadList.length; i++) {
		try {
			var item = lazyLoadList[i];
			var $element = item[0];
			var options = item[1];
			var offset = $element.data('offset.lazy');
			var condition = options.condition($element, offset) && (options.top != 0 || offset.left != 0);
			if (condition && offset.top+$element.height() > area.top && offset.top < area.bottom) {
				options.once && destroyBind($element);
				options.beforeLoad($element, options);
				_lazyLoad(item);
			}
		}
		catch (e) {
		}
	}
	removeLoaded();
};

var runTarget = function($element) {
	for (var i = 0; i < lazyLoadList.length; i++) {
		var curritem = lazyLoadList[i];
		if (curritem && curritem[0].get(0) == $element.get(0)) {
			curritem[1].once && destroyBind(curritem[0]);
			_lazyLoad(curritem);
			break;
		}
	}
};

var _lazyLoad = function(item) {
	var $element = item[0];
	var options = item[1];
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
				options.onLoad.call($element.get(0), options.res($element), options);
				$(window).trigger('scroll');
			}, 0);
		})($element, options);
	}
};

var removeLoaded = function() {
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
		'load.__lazy': function(e) {
			options.onLoad.call($image.get(0), e, options);
			$(this).off('.lazy');
			$(window).trigger('scroll');
		},
		'error.__lazy': function(e) {
			options.onError.call($image.get(0), e, options);
			$(this).off('.__lazy');
			$(window).trigger('scroll');
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
			options.onLoad.call($element.get(0), data, options);
		})
		.fail(function(jqXHR) {
			options.onError.call($element.get(0), jqXHR, options);
		})
		.always(function() {
			$(window).trigger('scroll');
		});
};

var updateOffset = function() {
	for (var i = 0; i < lazyLoadList.length; i++) {
		var item = lazyLoadList[i];
		item && (function(item) {
			setTimeout(function() {
				item[0].data('offset.lazy', item[1].offset(item[0]));
			}, 0);
		})(item);
	}
};

var refresh = function() {
	updateOffset();
	setTimeout(function() {
		$(window).trigger('scroll');
	}, 10);
};

/**
 * @param {jQuery} $element
 * @param {Object} options
 * @param {String} options.type 请求资源类型
 * @param {Boolean} options.once 是否只执行一次，对于type为image的，强制为true
 * @param {Function} options.condition 是否执行lazyLoad的条件判断，默认返回true
 * @param {String} options.beforeLoad 加载之前执行的回调
 * @param {String} options.onLoad 加载成功回调
 * @param {String} options.onError 加载失败回调
 * @param {Function} options.res 要请求的资源
 * @param {Function} [options.offset] 响应区域
 */
var lazyload = function($element, options) {
	options || (options = {});
	if (!$.isFunction(options.offset)) {
		options.offset = function($element) {
			return $element.offset();
		};
	}
	if ($element.get(0).tagName.toLowerCase() == 'img') {
		options.type = 'image';
	}
	options.condition || (options.condition = function() {
		return true;
	});
	if (options.type == 'image') {
		options.once = true;
		options.res || (options.res = $element.data('src'));
	}
	if (!$.isFunction(options.res)) {
		var res = options.res;
		options.res = function() {
			return res;
		};
	}
	$element.data('offset.lazy', options.offset($element));
	options.beforeLoad || (options.beforeLoad = function() {
	});
	options.onLoad || (options.onLoad = function() {
	});
	options.onError || (options.onError = function() {
	});
	lazyLoadList.push([$element, options]);
};

/**
 * @param {jQuery} $element
 */
var destroyBind = function($element) {
	for (var i = 0; i < lazyLoadList.length; i++) {
		var item = lazyLoadList[i];
		if (item && item[0].get(0) == $element.get(0)) {
			item[0].removeData('offset.lazy');
			lazyLoadList[i] = null;
			break;
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
		var remaining = wait-(now-previous);
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
var getCurrentArea = function() {
	var $window = $(window);
	var top = $window.scrollTop();
	return {
		top: top-$.lazy.sensitivity,
		bottom: top+$window.height()+$.lazy.sensitivity
	};
};

//初始化监听
$(window).on('scroll.__lazy', throttle(updateOffset, 100));
$(window).on('scroll.__lazy', throttle(processor, 1));

$.fn.lazy = function(options) {
	//注销
	if (options === 'destroy') {
		this.each(function() {
			destroyBind($(this));
		});
	}
	//强制加载
	else if (options == 'load') {
		this.each(function() {
			runTarget($(this));
		});
	}
	//lazyLoad
	else {
		this.each(function() {
			var $this = $(this);
			setTimeout(function() {
				lazyload($this, $.extend(true, {}, options));
			}, 0);
		});
		setTimeout(function() {
			$(window).trigger('scroll');
		}, 100);
	}
	return this;
};

$.lazy = {
	refresh: refresh,
	sensitivity: 50
};

