import { CanvasKit, CanvasView, CellView, PageView, Rect } from '../src';

const canvasContainer = document.createElement('div');
canvasContainer.style.width = '100%';
canvasContainer.style.height = '100%';
canvasContainer.style.position = 'relative';
document.body.append(canvasContainer);

const canvasView = await CanvasView.create(canvasContainer);

const pageView = new PageView();

for (let x = 0; x < 384; x += 128) {
	pageView.pushA([
		new CellView(new Rect(x, 0, 128, 32), {
			text: 'All Fix 固定行列',
			style: {
				fillColor: CanvasKit.Color(217, 217, 217),
				strokeColor: CanvasKit.Color(68, 67, 89)
			}
		})
	]);
}

for (let x = 0; x < 384; x += 128) {
	for (let y = 0; y < 960; y += 32) {
		pageView.pushAX([
			new CellView(new Rect(x, y, 128, 32), {
				text: 'Column Fix 固定列',
				style: {
					fillColor: CanvasKit.Color(240, 240, 240),
					strokeColor: CanvasKit.Color(68, 67, 89)
				}
			})
		]);
	}
}

for (let x = 0; x < 1920; x += 96) {
	pageView.pushAY([
		new CellView(new Rect(x, 0, 96, 32), {
			text: 'Row Fix 固定行',
			style: {
				fillColor: CanvasKit.Color(217, 217, 217),
				strokeColor: CanvasKit.Color(68, 67, 89)
			}
		})
	]);
}

for (let x = 0; x < 1920; x += 96) {
	for (let y = 0; y < 960; y += 32) {
		pageView.push([
			new CellView(new Rect(x, y, 96, 32), {
				text: 'Data 数据' + Date.now(),
				style: {
					fillColor: CanvasKit.WHITE,
					strokeColor: CanvasKit.Color(68, 67, 89)
				}
			})
		]);
	}
}

canvasView.selectPage(canvasView.pushPage(pageView) - 1);
canvasView.startTick();
