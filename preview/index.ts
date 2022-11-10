import { CanvasKitUtil, CanvasView, CellView, Rect } from '../src';

const canvasContainer = document.createElement('div');
canvasContainer.style.width = '100%';
canvasContainer.style.height = '100%';
canvasContainer.style.position = 'relative';
document.body.append(canvasContainer);

const canvasView = await CanvasView.create(canvasContainer);

const page = canvasView.currentPage;

for (let x = 0; x < 384; x += 128) {
	page.addFixedViews([
		new CellView(new Rect(x, 0, 128, 32), {
			text: 'All Fix 固定行列',
			style: {
				fillColor: CanvasKitUtil.CanvasKit.Color(217, 217, 217),
				strokeColor: CanvasKitUtil.CanvasKit.Color(68, 67, 89)
			}
		})
	]);
}

for (let x = 0; x < 384; x += 128) {
	for (let y = -1920; y < 1920; y += 32) {
		page.addXFixedViews([
			new CellView(new Rect(x, y, 128, 32), {
				text: 'Column Fix 固定列',
				style: {
					fillColor: CanvasKitUtil.CanvasKit.Color(240, 240, 240),
					strokeColor: CanvasKitUtil.CanvasKit.Color(68, 67, 89)
				}
			})
		]);
	}
}

for (let x = -3840; x < 3840; x += 96) {
	page.addYFixedViews([
		new CellView(new Rect(x, 0, 96, 32), {
			text: 'Row Fix 固定行',
			style: {
				fillColor: CanvasKitUtil.CanvasKit.Color(217, 217, 217),
				strokeColor: CanvasKitUtil.CanvasKit.Color(68, 67, 89)
			}
		})
	]);
}

for (let x = -3840; x < 3840; x += 96) {
	for (let y = -1920; y < 1920; y += 32) {
		page.addViews([
			new CellView(new Rect(x, y, 96, 32), {
				text: 'Data 数据' + Date.now(),
				style: {
					fillColor: CanvasKitUtil.CanvasKit.WHITE,
					strokeColor: CanvasKitUtil.CanvasKit.Color(68, 67, 89)
				}
			})
		]);
	}
}

canvasView.selectPage(canvasView.pushPage(page) - 1);
canvasView.startTick();
