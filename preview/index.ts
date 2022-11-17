import { CanvasView, CellPage } from '../src';
import { info } from '../src/utils';
import columnModel from './columnModel.json';
import cellsModel from './cellsModel.json';
import bookingsModel from './bookingsModel.json';

document.documentElement.style.width = '100%';
document.documentElement.style.height = '100%';
document.documentElement.style.margin = '0';
document.body.style.width = '100%';
document.body.style.height = '100%';
document.body.style.margin = '0';

const canvasContainer = document.createElement('div');
canvasContainer.style.width = '100%';
canvasContainer.style.height = '100%';
canvasContainer.style.position = 'relative';
document.body.append(canvasContainer);

const canvasView = await CanvasView.create(canvasContainer);
canvasView.loading = true;
canvasView.startTick();

const page = CellPage.new(columnModel, bookingsModel, cellsModel);
page.updateFromModel();

// 就算用idle也会阻塞skia渲染lottie动画
requestIdleCallback(() => {
	const start = Date.now();
	page?.prebuild();
	info('unknown', `costs: ${Date.now() - start}`);
	// 1787ms
});

// todo 一次性把所有的view都prebuild掉会有很长一段的页面空白期，
//  同时loading的动画也是无法加载的，除非将loading动画放到这块canvas之外加载
// 基本render的cost在60ms之内都是可以接受的
canvasView.selectPage(canvasView.addPage(page));
canvasView.loading = false;
