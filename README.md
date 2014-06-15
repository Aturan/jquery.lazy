# jquery.lazy

---

[![spm version](http://spmjs.io/badge/jquery.lazy)](http://spmjs.io/package/jquery.lazy)

A lazy load data for jQuery plugin

---

## Install

```
$ spm install jquery.lazy --save
```

## Usage

```js
require('easing');

//绑定lazyload
$('img').lazy({
	type: 'toggle',
	once: true,
	beforeLoad: before,
	onLoad: success,
	onError: error
});

// 强制加载
$('img.lazyload').lazy('load');

// 卸载lazyload绑定
$('img').lazy('destroy');

```

## Api

### $.lazy.refresh
`Function`

### $.lazy.sensitivity
`options`

