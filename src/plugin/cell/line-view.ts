import { BaseView, getBaseViewId, ViewType } from '../../view/base/base-view';
import { Rect } from '../../base/rect';
import { CanvasKitUtil, COLOR } from '../../view/utils';
import { Canvas } from 'canvaskit-wasm';

export type LineView = BaseView & {
	lineColor: COLOR;
};

export function newLineViewFromH(x: number, y: number, w: number): LineView {
	return {
		id: getBaseViewId().toString(),
		type: ViewType.Line,
		frame: new Rect(x, y, w, 0),
		es: {},
		sp: [undefined, undefined, undefined, undefined],
		lineColor: COLOR.SHIRONEZUMI
	};
}

export function newLineViewFromV(x: number, y: number, h: number): LineView {
	return {
		id: getBaseViewId().toString(),
		type: ViewType.Line,
		frame: new Rect(x, y, 0, h),
		es: {},
		sp: [undefined, undefined, undefined, undefined],
		lineColor: COLOR.SHIRONEZUMI
	};
}

export function renderLine(canvas: Canvas, view: LineView) {
	canvas.drawLine(
		view.frame.left,
		view.frame.top,
		view.frame.right,
		view.frame.bottom,
		CanvasKitUtil.fillPaint(view.lineColor)
	);
}
