// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import CanvasKitInit from '@skeditor/canvaskit-wasm/bin/canvaskit.js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import CanvasKitWasm from '@skeditor/canvaskit-wasm/bin/canvaskit.wasm?url';
import { CanvasKit, FontMgr, Typeface } from '@skeditor/canvaskit-wasm';
import fontFZBlack from '../assets/fonts/FZBlack.ttf';
import { info } from './logger';
import invariant from 'ts-invariant';

export class CanvasKitUtil {
	static CanvasKit: CanvasKit;
	static FontMgr: FontMgr;
	static Typeface: Typeface;

	static async loadCanvasKit() {
		const start = Date.now();
		return await CanvasKitInit({ locateFile: () => CanvasKitWasm }).then((canvasKit: CanvasKit) => {
			CanvasKitUtil.CanvasKit = canvasKit;
			info('load', `load wasm and font costs: ${Date.now() - start}`);
		});
	}

	static async loadFont() {
		await fetch(fontFZBlack).then((resp) => {
			resp.arrayBuffer().then((buffer) => {
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
}
