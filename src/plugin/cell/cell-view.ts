import { BaseView, getBaseViewId, ViewType } from '../../view/base/base-view';
import { Rect } from '../../base/rect';
import { EventSupport } from '../../view/base/event-support';
import { Canvas } from 'canvaskit-wasm';
import { CanvasKitUtil, COLOR } from '../../view/utils';
import { Point } from '../../base/point';
import { CanvasView } from '../../view/canvas-view';

type CellConfig = {
	text?: string;
	fillColor?: COLOR;
	strokeColor?: COLOR;
	hoverColor?: COLOR;
};

export type CellView = BaseView & {
	config: CellConfig;
};

export function newCellViewFrom(
	x: number,
	y: number,
	w: number,
	h: number,
	cf: CellConfig,
	es: EventSupport
): CellView {
	return {
		id: getBaseViewId().toString(),
		type: ViewType.Cell,
		frame: new Rect(x, y, w, h),
		config: cf,
		es,
		sp: [5, 5, undefined, undefined]
	};
}

function textPos(view: CellView): Point {
	return view.frame.leftTop.add(new Point(5, (view.frame.h - 12) / 2 + 12));
}

function actualText(view: CellView): string | undefined {
	if (view.config.text) {
		let width = 0;
		let actualText = view.config.text;
		// 因为只使用了等宽字体，所以可以直接根据字符数计算宽度，避免查询字体图元
		for (let i = 0; i < view.config.text.length; i += 1) {
			if (view.config.text.charCodeAt(i) > 128) {
				width += 12;
			} else {
				width += 7;
			}
			if (width > view.frame.w) {
				actualText = view.config.text.slice(0, i - 3) + '...';
				break;
			}
		}
		return actualText;
	}
}

export function renderCell(canvas: Canvas, view: CellView) {
	if (CanvasView.currentContext.pageState.ifHover(view) && view.config.hoverColor) {
		canvas.drawRect(view.frame.toFloat32Array(), CanvasKitUtil.fillPaint(view.config.hoverColor));
	} else if (view.config.fillColor) {
		canvas.drawRect(view.frame.toFloat32Array(), CanvasKitUtil.fillPaint(view.config.fillColor));
	}
	if (view.config.strokeColor) {
		canvas.drawRect(
			view.frame.toFloat32Array(),
			CanvasKitUtil.strokePaint(view.config.strokeColor)
		);
	}
	const text = actualText(view);
	if (text) {
		const pos = textPos(view);
		canvas.drawText(text, pos.x, pos.y, CanvasKitUtil.fillPaint(COLOR.RO), CanvasKitUtil.font(12));
	}
}
