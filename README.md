#jquery.lazy
一个延迟加载数据(image、HTML等等)的jQuery插件


##如何工作
当指定元素在用户可视范围内时加载数据，成功时会触发`load.lazy`事件，失败会触发`error.lazy`事件
包含两个方法：`$.lazy`、`$.fn.lazy`
* $.lazy会返回Promise(*基于一致性，$.fn.lazy不返回Promise*)
* $.fn.lazy提供了简单的延迟加载图片、HTML的能力


##如何使用


##测试用例


##参考链接
* DataLazyload: http://docs.kissyui.com/docs/html/api/component/datalazyload/


##License
MIT