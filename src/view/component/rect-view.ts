import { Color, Paint } from '@skeditor/canvaskit-wasm';
import { Rect } from '../../base/rect';
import { BaseLayerView } from '../base/base-layer-view';
import { CanvasKit } from '../../utils';

export class RectView extends BaseLayerView {
	constructor(
		readonly rect: Rect,
		readonly fillColor: Color = CanvasKit.TRANSPARENT,
		readonly radius: number = 0,
		readonly enableHover = true
	) {
		super(rect);
	}

	_painter?: RectPainter;

	private get painter() {
		if (!this._painter) {
			this._painter = new RectPainter(this);
		}
		return this._painter;
	}

	_hoverPainter?: RectHoverPainter;

	private get hoverPainter() {
		if (!this._hoverPainter) {
			this._hoverPainter = new RectHoverPainter(this);
		}
		return this._hoverPainter;
	}

	_render(): void {
		if (this.ctx.pageState.hoverLayerView?.id == this.id) {
			this.hoverPainter.paint();
		} else {
			this.painter.paint();
		}
	}
}

type RectPaintInfo = { rect: Float32Array; paint: Paint };

export class RectPainter {
	constructor(private view: RectView) {}

	private _cachePaintInfo?: RectPaintInfo;

	get cachePaintInfo() {
		if (!this._cachePaintInfo) {
			this._cachePaintInfo = this.buildPaintInfo();
		}
		return this._cachePaintInfo;
	}

	paint() {
		this.paintWith(this.cachePaintInfo);
	}

	private buildPaintInfo(): RectPaintInfo {
		const { rect, fillColor, radius } = this.view;
		const paint = new CanvasKit.Paint();
		paint.setColor(fillColor);
		paint.setAntiAlias(true);
		return {
			rect: rect.toRRectXY(radius, radius),
			paint
		};
	}

	private paintWith(paintInfo: RectPaintInfo | undefined) {
		if (!paintInfo) return;
		const { rect, paint } = paintInfo;
		const { skCanvas } = this.view.ctx;

		skCanvas.drawRRect(rect, paint);
	}
}

export class RectHoverPainter {
	constructor(private view: RectView) {}

	private _cachePaintInfo?: RectPaintInfo;

	get cachePaintInfo() {
		if (!this._cachePaintInfo) {
			this._cachePaintInfo = this.buildPaintInfo();
		}
		return this._cachePaintInfo;
	}

	paint() {
		this.paintWith(this.cachePaintInfo);
	}

	private buildPaintInfo(): RectPaintInfo {
		const { rect, radius } = this.view;
		const paint = new CanvasKit.Paint();
		paint.setColor(CanvasKit.Color(0, 137, 167));
		paint.setAntiAlias(true);
		return {
			rect: rect.toRRectXY(radius, radius),
			paint
		};
	}

	private paintWith(paintInfo: RectPaintInfo | undefined) {
		if (!paintInfo) return;
		const { rect, paint } = paintInfo;
		const { skCanvas } = this.view.ctx;

		skCanvas.drawRRect(rect, paint);
	}
}
