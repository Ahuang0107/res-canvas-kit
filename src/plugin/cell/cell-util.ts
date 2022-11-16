import { Rect } from '../../base/rect';
import { Color } from '@skeditor/canvaskit-wasm';
import { ComponentCaches, DrawCache, RectCache, TextCache } from '../../view/base/cache';
import { CanvasKitUtil } from '../../utils';
import { Point } from '../../base/point';

export type CellConfig = {
	text?: string;
	textSize?: number;
	style?: CellStyle;
	hoverStyle?: CellStyle;
	focusStyle?: CellStyle;
};

type CellStyle = {
	fillColor?: Color;
	strokeColor?: Color;
};

// todo 需要避免创建多余的ParaCache，所以hover和focus时尽量也使用同一个cache
export function buildCell(frame: Rect, config: CellConfig): ComponentCaches {
	const { text, textSize = 12, style, hoverStyle, focusStyle } = config;

	let normalCache: DrawCache[] | undefined = undefined;
	if (style) {
		normalCache = [];
		const { fillColor, strokeColor } = style;

		// todo 这里只是设置一个颜色的paint的话，不需要每次创建这个对象
		if (fillColor) {
			normalCache.push(new RectCache(frame, CanvasKitUtil.fillPaint(fillColor)));
		}

		if (strokeColor) {
			normalCache.push(new RectCache(frame, CanvasKitUtil.strokePaint(strokeColor)));
		}
	}

	let hoverCache: DrawCache[] | undefined = undefined;
	if (hoverStyle) {
		hoverCache = [];
		const { fillColor: hoverFillColor, strokeColor: hoverStrokeColor } = hoverStyle;
		if (hoverFillColor) {
			hoverCache.push(new RectCache(frame, CanvasKitUtil.fillPaint(hoverFillColor)));
		}

		if (hoverStrokeColor) {
			hoverCache.push(new RectCache(frame, CanvasKitUtil.strokePaint(hoverStrokeColor)));
		}
	}

	let focusCache: DrawCache[] | undefined = undefined;

	if (focusStyle) {
		focusCache = [];
		const { fillColor: focusFillColor, strokeColor: focusStrokeColor } = focusStyle;
		if (focusFillColor) {
			focusCache.push(new RectCache(frame, CanvasKitUtil.fillPaint(focusFillColor)));
		}

		if (focusStrokeColor) {
			focusCache.push(new RectCache(frame, CanvasKitUtil.strokePaint(focusStrokeColor)));
		}
	}

	let cache: DrawCache[] | undefined = undefined;
	if (text) {
		cache = [];
		// const paraStyle = CanvasKitUtil.paragraphStyle(textSize);
		// const paraCache = new ParaCache(
		// 	frame,
		// 	text,
		// 	paraStyle,
		// 	new Point(0, (frame.height - textSize) / 2),
		// 	true
		// );
		const paraCache = new TextCache(frame, text, new Point(5, (frame.height - 12) / 2 + 12));
		cache?.push(paraCache);
	}

	return {
		cache,
		normalCache,
		hoverCache,
		focusCache
	};
}
