# readme

preview增加了`--base=/canvas/`是因为本地开发时数据是请求本地另一个端口的服务的，
该服务因为shiro与spring-cors冲突，无法开启cors，目前通过nginx反向代理解决跨域问题，但是通过转发的路径访问会遇到
`Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of
"text/html". Strict MIME type checking is enforced for module scripts per HTML spec.`问题，目前通过添加--base配置来解决

camera移动实际上是在绘制时canvas调用concat修改matrix，所以目前是先绘制绝对定位元素然后再调用concat，然后再绘制相对定位元素

元素的层级是没有定义的，完全依靠加入数组的先后来决定的，目前将view打造成平级的，如果增加层级的话：

1. BaseView增加z轴参数，绘制时先distinct出所有z轴值，按照顺序去渲染对应view
2. 增加GroupView，将目前平级的view修改成tree的结构

使用了增加Z轴的方法，因为对于比较分散的table cell数据，group结构的意义不大
