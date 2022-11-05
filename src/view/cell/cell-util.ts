import { Rect } from '../../base/rect';
import { Color } from '@skeditor/canvaskit-wasm';
import { CanvasKit, fontMgr } from '../../utils';
import { ComponentCaches, DrawCache, ParaCache, RectCache } from '../base/cache';
import { Point } from '../../base/point';

export type CellConfig = {
	text?: string;
	textSize?: number;
	style: CellStyle;
	hoverStyle?: CellStyle;
	focusStyle?: CellStyle;
};

type CellStyle = {
	fillColor?: Color;
	strokeColor?: Color;
	textColor?: Color;
};

export function buildCell(frame: Rect, config: CellConfig): ComponentCaches {
	const { text, textSize = 12, style, hoverStyle, focusStyle } = config;

	const { fillColor, strokeColor, textColor = CanvasKit.BLACK } = style;
	const cache: DrawCache[] = [];

	// todo 这里只是设置一个颜色的paint的话，不需要每次创建这个对象
	if (fillColor) {
		const fillPaint = new CanvasKit.Paint();
		fillPaint.setColor(fillColor);
		cache.push(new RectCache(frame.toXYWHRect(), fillPaint));
	}

	if (strokeColor) {
		const strokePaint = new CanvasKit.Paint();
		strokePaint.setColor(strokeColor);
		strokePaint.setStyle(CanvasKit.PaintStyle.Stroke);
		strokePaint.setStrokeWidth(1);
		cache.push(new RectCache(frame.toXYWHRect(), strokePaint));
	}

	if (text) {
		const paraStyle = new CanvasKit.ParagraphStyle({
			textStyle: {
				color: textColor,
				fontSize: textSize
			},
			textAlign: CanvasKit.TextAlign.Center,
			maxLines: 1,
			ellipsis: '...'
		});
		const builder = CanvasKit.ParagraphBuilder.Make(paraStyle, fontMgr!);
		builder.addText(text);
		const para = builder.build();
		para.layout(frame.width);
		cache.push(new ParaCache(para, frame.leftTop.add(new Point(0, (frame.height - textSize) / 2))));
		builder.delete();
	}

	let hoverCache: DrawCache[] | undefined = undefined;
	if (hoverStyle) {
		hoverCache = [];
		const {
			fillColor: hoverFillColor = fillColor,
			strokeColor: hoverStrokeColor = strokeColor,
			textColor: hoverTextColor = textColor
		} = hoverStyle;
		if (hoverFillColor) {
			const fillPaint = new CanvasKit.Paint();
			fillPaint.setColor(hoverFillColor);
			hoverCache.push(new RectCache(frame.toXYWHRect(), fillPaint));
		}

		if (hoverStrokeColor) {
			const strokePaint = new CanvasKit.Paint();
			strokePaint.setColor(hoverStrokeColor);
			strokePaint.setStyle(CanvasKit.PaintStyle.Stroke);
			strokePaint.setStrokeWidth(1);
			hoverCache.push(new RectCache(frame.toXYWHRect(), strokePaint));
		}

		if (text) {
			const paraStyle = new CanvasKit.ParagraphStyle({
				textStyle: {
					color: hoverTextColor,
					fontSize: textSize
				},
				textAlign: CanvasKit.TextAlign.Center,
				maxLines: 1,
				ellipsis: '...'
			});
			const builder = CanvasKit.ParagraphBuilder.Make(paraStyle, fontMgr!);
			builder.addText(text);
			const para = builder.build();
			para.layout(frame.width);
			hoverCache.push(
				new ParaCache(para, frame.leftTop.add(new Point(0, (frame.height - textSize) / 2)))
			);
			builder.delete();
		}
	}

	let focusCache: DrawCache[] | undefined = undefined;

	if (focusStyle) {
		focusCache = [];
		const {
			fillColor: focusFillColor = fillColor,
			strokeColor: focusStrokeColor = strokeColor,
			textColor: focusTextColor = textColor
		} = focusStyle;
		if (focusFillColor) {
			const fillPaint = new CanvasKit.Paint();
			fillPaint.setColor(focusFillColor);
			focusCache.push(new RectCache(frame.toXYWHRect(), fillPaint));
		}

		if (focusStrokeColor) {
			const strokePaint = new CanvasKit.Paint();
			strokePaint.setColor(focusStrokeColor);
			strokePaint.setStyle(CanvasKit.PaintStyle.Stroke);
			strokePaint.setStrokeWidth(1);
			focusCache.push(new RectCache(frame.toXYWHRect(), strokePaint));
		}

		if (text) {
			const paraStyle = new CanvasKit.ParagraphStyle({
				textStyle: {
					color: focusTextColor,
					fontSize: textSize
				},
				textAlign: CanvasKit.TextAlign.Center,
				maxLines: 1,
				ellipsis: '...'
			});
			const builder = CanvasKit.ParagraphBuilder.Make(paraStyle, fontMgr!);
			builder.addText(text);
			const para = builder.build();
			para.layout(frame.width);
			focusCache.push(
				new ParaCache(para, frame.leftTop.add(new Point(0, (frame.height - textSize) / 2)))
			);
			builder.delete();
		}
	}

	return {
		cache,
		hoverCache,
		focusCache
	};
}
