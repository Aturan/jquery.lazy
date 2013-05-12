#jquery.lazy
一个延迟请求/获取数据数据(image、HTML、JSON等等)的jQuery插件

##如何工作
当指定元素出现在用户视窗范围内时，则开始加载数据

成功时会触发`load`事件，失败会触发`error`事件

对于要加载的数据类型，插件会通过参数自动判断加载类型

##插件方法
#####`Promise` $.lazy
底层的方法，实现了延迟数据加载，返回Promise

方法列表:
$.lazy(`Element`, `callback`)

$.lazy(`Element`, `url`)

$.lazy(`Element`, `HTMLImageElement`)

$.lazy(`Element`, `HTMLTextAreaElement`)

$.lazy(`Element`, `HTMLScriptElement`)

#####`jQuery` $.fn.lazy
`$.fn.lazy`提供了简单的延迟加载图片、HTML的能力

**(基于一致性，`$.fn.lazy`不返回`Promise`)**



##如何使用



##测试用例



##参考链接
* dataLazyload: http://docs.kissyui.com/docs/html/api/component/datalazyload/



##License
MIT
