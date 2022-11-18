import CanvasKitInit, { CanvasKit, Font, FontMgr, Paint, Typeface } from 'canvaskit-wasm';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import CanvasKitWasm from 'canvaskit-wasm/bin/canvaskit.wasm?url';
import MicrosoftYaHeiMono from '../../assets/fonts/MSYHMONO.ttf';
import { info, logMeasureTime } from '../../utils';
import invariant from 'ts-invariant';

export enum COLOR {
	// 038 緋
	AKE = '#CC543A',
	// 042 铅丹
	ENTAN = '#D75455',
	// 084 朽葉
	KUCHIBA = '#E2943B',
	// 103 花葉
	HANABA = '#F7C242',
	// 138 鶸萌黃
	HIWAMOEGI = '#90B44B',
	// 139 柳染
	YANAGIZOME = '#91AD70',
	// 233 白練
	SHIRONERI = '#FCFAF2',
	// 234 胡粉
	GOFUN = '#FFFFFB',
	// 235 白鼠
	SHIRONEZUMI = '#BDC0BA',
	// 236 銀鼠
	GINNEZUMI = '#91989F',
	// 245 藍墨茶
	AISUMICHA = '#373C38',
	// 250 呂
	RO = '#0C0C0C'
}

export class CanvasKitUtil {
	static CanvasKit: CanvasKit;
	static FontMgr: FontMgr;
	static Typeface: Typeface;
	static FontMap: Map<number, Font> = new Map();
	static FillPaintMap: Map<COLOR, Paint> = new Map();
	static StrokePaintMap: Map<COLOR, Paint> = new Map();
	static colorMap: Map<COLOR, Float32Array> = new Map();

	static async loadCanvasKit() {
		logMeasureTime();
		return await CanvasKitInit({ locateFile: () => CanvasKitWasm }).then((canvasKit: CanvasKit) => {
			CanvasKitUtil.CanvasKit = canvasKit;
			logMeasureTime('CanvasKit Load');
		});
	}

	static async loadFont() {
		await fetch(MicrosoftYaHeiMono).then(async (resp) => {
			await resp.arrayBuffer().then((buffer) => {
				const fontMgr = CanvasKitUtil.CanvasKit.FontMgr.FromData(buffer);
				invariant(fontMgr, 'fail to create fontMgr');
				CanvasKitUtil.FontMgr = fontMgr;
				const typeface = CanvasKitUtil.CanvasKit.Typeface.MakeFreeTypeFaceFromData(buffer);
				invariant(typeface, 'fail to make typeface');
				CanvasKitUtil.Typeface = typeface;
				const count = fontMgr?.countFamilies() ?? 0;
				for (let i = 0; i < count; i++) {
					info('Font Loaded', `${fontMgr?.getFamilyName(i)}`);
				}
			});
		});
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

	static fillPaint(color: COLOR): Paint {
		if (!this.FillPaintMap.has(color)) {
			const paint = new CanvasKitUtil.CanvasKit.Paint();
			paint.setColor(CanvasKitUtil.color(color));
			this.FillPaintMap.set(color, paint);
		}
		const paint = this.FillPaintMap.get(color);
		invariant(paint, 'fail to get Fill Paint');
		return paint;
	}

	static strokePaint(color: COLOR): Paint {
		if (!this.StrokePaintMap.has(color)) {
			const paint = new CanvasKitUtil.CanvasKit.Paint();
			paint.setColor(CanvasKitUtil.color(color));
			paint.setStyle(this.CanvasKit.PaintStyle.Stroke);
			paint.setStrokeWidth(1);
			this.StrokePaintMap.set(color, paint);
		}
		const paint = this.StrokePaintMap.get(color);
		invariant(paint, 'fail to get Stroke Paint');
		return paint;
	}

	protected static color(color: COLOR): Float32Array {
		if (!this.colorMap.size) {
			Object.values(COLOR).forEach((e) => {
				const r = parseInt(e.charAt(1) + e.charAt(2), 16);
				const g = parseInt(e.charAt(3) + e.charAt(4), 16);
				const b = parseInt(e.charAt(5) + e.charAt(6), 16);
				let a = 255;
				if (e.charAt(7) !== '' && e.charAt(8) !== '') {
					a = parseInt(e.charAt(7) + e.charAt(8), 16);
				}
				this.colorMap.set(e, new Float32Array([r / 255, g / 255, b / 255, a / 255]));
			});
		}
		const colorArray = this.colorMap.get(color);
		invariant(colorArray, `fail to get color with index ${color}`);
		return colorArray;
	}
}
