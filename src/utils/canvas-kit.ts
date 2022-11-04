// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import CanvasKitInit from '@skeditor/canvaskit-wasm/bin/canvaskit.js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import CanvasKitWasm from '@skeditor/canvaskit-wasm/bin/canvaskit.wasm?url';
import { CanvasKit } from '@skeditor/canvaskit-wasm';

let CanvasKit: CanvasKit;

export const CanvasKitPromised = CanvasKitInit({ locateFile: () => CanvasKitWasm }).then(
	(canvasKit: CanvasKit) => {
		CanvasKit = canvasKit;
		return canvasKit;
	}
);

export { CanvasKit };
