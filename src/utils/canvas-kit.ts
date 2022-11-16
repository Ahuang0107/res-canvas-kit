// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import CanvasKitInit from '@skeditor/canvaskit-wasm/bin/canvaskit.js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import CanvasKitWasm from '@skeditor/canvaskit-wasm/bin/canvaskit.wasm?url';
import { CanvasKit, Font, FontMgr, Paint, ParagraphStyle, Typeface } from '@skeditor/canvaskit-wasm';
import fontFZBlack from '../assets/fonts/FZBlack.ttf';
import { info } from './logger';
import invariant from 'ts-invariant';

export class CanvasKitUtil {
	static CanvasKit: CanvasKit;
	static FontMgr: FontMgr;
	static Typeface: Typeface;
	static ParagraphStyleMap: Map<number, ParagraphStyle> = new Map();
	static FontMap: Map<number, Font> = new Map();
	static FillPaint: Map<Float32Array, Paint> = new Map();
	static StrokePaint: Map<Float32Array, Paint> = new Map();

	static async loadCanvasKit() {
		const start = Date.now();
		return await CanvasKitInit({ locateFile: () => CanvasKitWasm }).then((canvasKit: CanvasKit) => {
			CanvasKitUtil.CanvasKit = canvasKit;
			info('load', `load wasm and font costs: ${Date.now() - start}`);
		});
	}

	static async loadFont() {
		await fetch(fontFZBlack).then(async (resp) => {
			await resp.arrayBuffer().then((buffer) => {
				const fontMgr = CanvasKitUtil.CanvasKit.FontMgr.FromData(buffer);
				invariant(fontMgr, 'fail to create fontMgr');
				CanvasKitUtil.FontMgr = fontMgr;
				const typeface = CanvasKitUtil.CanvasKit.Typeface.MakeFreeTypeFaceFromData(buffer);
				invariant(typeface, 'fail to make typeface');
				CanvasKitUtil.Typeface = typeface;
				const count = fontMgr?.countFamilies() ?? 0;
				for (let i = 0; i < count; i++) {
					info('font', `loaded font ${fontMgr?.getFamilyName(i)}`);
				}
			});
		});
	}

	static paragraphStyle(textSize: number): ParagraphStyle {
		if (!this.ParagraphStyleMap.has(textSize)) {
			this.ParagraphStyleMap.set(
				textSize,
				new CanvasKitUtil.CanvasKit.ParagraphStyle({
					textStyle: {
						color: CanvasKitUtil.CanvasKit.BLACK,
						fontSize: textSize
					},
					textAlign: CanvasKitUtil.CanvasKit.TextAlign.Center,
					maxLines: 1,
					ellipsis: '...'
				})
			);
		}
		const paraStyle = this.ParagraphStyleMap.get(textSize);
		invariant(paraStyle, 'fail to get ParagraphStyle');
		return paraStyle;
	}

	static font(textSize: number): Font {
		if (!this.FontMap.has(textSize)) {
			const font = new CanvasKitUtil.CanvasKit.Font(this.Typeface, textSize);
			this.FontMap.set(textSize, font);
		}
		const font = this.FontMap.get(textSize);
		invariant(font, 'fail to get Font');
		return font;
	}

	static fillPaint(color: Float32Array): Paint {
		if (!this.FillPaint.has(color)) {
			const paint = new CanvasKitUtil.CanvasKit.Paint();
			paint.setColor(color);
			this.FillPaint.set(color, paint);
		}
		const paint = this.FillPaint.get(color);
		invariant(paint, 'fail to get Fill Paint');
		return paint;
	}

	static strokePaint(color: Float32Array): Paint {
		if (!this.StrokePaint.has(color)) {
			const paint = new CanvasKitUtil.CanvasKit.Paint();
			paint.setColor(color);
			paint.setStyle(this.CanvasKit.PaintStyle.Stroke);
			paint.setStrokeWidth(1);
			this.StrokePaint.set(color, paint);
		}
		const paint = this.StrokePaint.get(color);
		invariant(paint, 'fail to get Stroke Paint');
		return paint;
	}
}
