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

$('#demo').lazy({
        width: 'toggle',
        height: 'toggle'
    }, {
    duration: 5000,
    specialEasing: {
        width: 'linear',
        height: 'elasticBoth' // 直接使用扩展的平滑函数名就好
    },
    complete: function() {
        $(this).after('<div>Animation complete.</div>');
    }
});
```

## Api

### $.lazy.refresh
`Function`

### $.lazy.sensitivity
`options`

