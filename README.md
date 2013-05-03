#jquery.lazy
一个延迟加载数据(例如image、HTML)的jQuery插件



##如何工作
当指定元素出现在用户视窗范围内时，则开始加载数据

成功时会触发`load.lazy`事件，失败会触发`error.lazy`事件

对于要加载的数据类型，插件会自动判断是加载image还是ajax，无需用户自行判断

##插件方法
###$.lazy
$.lazy是底层办法

*返回值:* `Promise`

###$.fn.lazy
`$.fn.lazy`提供了简单的延迟加载图片、HTML的能力
**(基于一致性，$.fn.lazy不返回Promise)**



##如何使用



##测试用例



##参考链接
* DataLazyload: http://docs.kissyui.com/docs/html/api/component/datalazyload/



##License
MIT
