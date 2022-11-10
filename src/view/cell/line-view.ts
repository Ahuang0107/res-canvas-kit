import { BaseView } from '../base/base-view';
import { ComponentCaches, DrawCache, LineCache } from '../base/cache';
import { Rect } from '../../base/rect';
import { Color } from '@skeditor/canvaskit-wasm';
import { CanvasKitUtil } from '../../utils';

export class LineView extends BaseView {
	constructor(frame: Rect, private fillColor?: Color, z?: number) {
		super(frame, z);
	}

	protected build(): ComponentCaches {
		const cache: DrawCache[] = [];
		if (this.fillColor) {
			const fillPaint = new CanvasKitUtil.CanvasKit.Paint();
			fillPaint.setColor(this.fillColor);
			cache.push(new LineCache(this.frame, fillPaint));
		}
		return {
			cache: cache
		};
	}
}
