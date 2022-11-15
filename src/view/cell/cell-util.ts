import { Rect } from '../../base/rect';
import { Color } from '@skeditor/canvaskit-wasm';
import { ComponentCaches, DrawCache, ParaCache, RectCache } from '../base/cache';
import { Point } from '../../base/point';
import { CanvasKitUtil } from '../../utils';

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

	let cache: DrawCache[] | undefined = undefined;
	if (style) {
		cache = [];
		const { fillColor, strokeColor } = style;

		// todo 这里只是设置一个颜色的paint的话，不需要每次创建这个对象
		if (fillColor) {
			const fillPaint = new CanvasKitUtil.CanvasKit.Paint();
			fillPaint.setColor(fillColor);
			cache.push(new RectCache(frame, fillPaint));
		}

		if (strokeColor) {
			const strokePaint = new CanvasKitUtil.CanvasKit.Paint();
			strokePaint.setColor(strokeColor);
			strokePaint.setStyle(CanvasKitUtil.CanvasKit.PaintStyle.Stroke);
			strokePaint.setStrokeWidth(1);
			cache.push(new RectCache(frame, strokePaint));
		}
	}

	let hoverCache: DrawCache[] | undefined = undefined;
	if (hoverStyle) {
		hoverCache = [];
		const { fillColor: hoverFillColor, strokeColor: hoverStrokeColor } = hoverStyle;
		if (hoverFillColor) {
			const fillPaint = new CanvasKitUtil.CanvasKit.Paint();
			fillPaint.setColor(hoverFillColor);
			hoverCache.push(new RectCache(frame, fillPaint));
		}

		if (hoverStrokeColor) {
			const strokePaint = new CanvasKitUtil.CanvasKit.Paint();
			strokePaint.setColor(hoverStrokeColor);
			strokePaint.setStyle(CanvasKitUtil.CanvasKit.PaintStyle.Stroke);
			strokePaint.setStrokeWidth(1);
			hoverCache.push(new RectCache(frame, strokePaint));
		}
	}

	let focusCache: DrawCache[] | undefined = undefined;

	if (focusStyle) {
		focusCache = [];
		const { fillColor: focusFillColor, strokeColor: focusStrokeColor } = focusStyle;
		if (focusFillColor) {
			const fillPaint = new CanvasKitUtil.CanvasKit.Paint();
			fillPaint.setColor(focusFillColor);
			focusCache.push(new RectCache(frame, fillPaint));
		}

		if (focusStrokeColor) {
			const strokePaint = new CanvasKitUtil.CanvasKit.Paint();
			strokePaint.setColor(focusStrokeColor);
			strokePaint.setStyle(CanvasKitUtil.CanvasKit.PaintStyle.Stroke);
			strokePaint.setStrokeWidth(1);
			focusCache.push(new RectCache(frame, strokePaint));
		}
	}

	if (text) {
		const paraStyle = new CanvasKitUtil.CanvasKit.ParagraphStyle({
			textStyle: {
				color: CanvasKitUtil.CanvasKit.BLACK,
				fontSize: textSize
			},
			textAlign: CanvasKitUtil.CanvasKit.TextAlign.Center,
			maxLines: 1,
			ellipsis: '...'
		});
		const paraCache = new ParaCache(
			frame,
			text,
			paraStyle,
			new Point(0, (frame.height - textSize) / 2),
			true
		);
		cache?.push(paraCache);
		hoverCache?.push(paraCache);
		focusCache?.push(paraCache);
	}

	return {
		cache,
		hoverCache,
		focusCache
	};
}
