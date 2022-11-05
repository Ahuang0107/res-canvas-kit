// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import CanvasKitInit from '@skeditor/canvaskit-wasm/bin/canvaskit.js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import CanvasKitWasm from '@skeditor/canvaskit-wasm/bin/canvaskit.wasm?url';
import { CanvasKit, FontMgr, Typeface } from '@skeditor/canvaskit-wasm';
import Logger from '../logging/logger';
import fontFZBlack from '../assets/fonts/FZBlack.ttf';

let CanvasKit: CanvasKit;
let fontMgr: FontMgr | null;
let typeface: Typeface | null;

export const CanvasKitPromised = CanvasKitInit({ locateFile: () => CanvasKitWasm }).then(
	(canvasKit: CanvasKit) => {
		CanvasKit = canvasKit;
		// todo 这里需要找一个字体是中英繁简都可以的
		fetch(fontFZBlack).then((resp) => {
			resp.arrayBuffer().then((buffer) => {
				fontMgr = CanvasKit.FontMgr.FromData(buffer);
				typeface = CanvasKit.Typeface.MakeFreeTypeFaceFromData(buffer);
				const count = fontMgr?.countFamilies() ?? 0;
				for (let i = 0; i < count; i++) {
					Logger.info('font', `loaded font ${fontMgr?.getFamilyName(i)}`);
				}
			});
		});
		return canvasKit;
	}
);

export { CanvasKit, fontMgr, typeface };
