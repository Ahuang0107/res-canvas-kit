import { BaseLayerView } from '../base/base-layer-view';
import { Rect } from '../../base/rect';
import { SkottieAnimation } from 'canvaskit-wasm';
import { CanvasKit } from '../../utils';

export class AnimaView extends BaseLayerView {
	private readonly firstFrame: number;

	constructor(readonly rect: Rect, readonly json: string) {
		super(rect);
		this.firstFrame = new Date().getTime();
	}

	_painter?: AnimationPainter;
	private get painter(): AnimationPainter {
		if (!this._painter) {
			this._painter = new AnimationPainter(this);
		}
		return this._painter;
	}

	_render(): void {
		this.painter.paint();
	}
}

type AnimationPaintInfo = { firstFrame: number; rect: Float32Array; animation: SkottieAnimation };

export class AnimationPainter {
	constructor(private view: AnimaView) {}

	private _cachePaintInfo?: AnimationPaintInfo;
	get cachePaintInfo() {
		if (!this._cachePaintInfo) {
			this._cachePaintInfo = this.buildPaintInfo();
		}
		return this._cachePaintInfo;
	}

	paint() {
		this.paintWith(this.cachePaintInfo);
	}

	private buildPaintInfo(): AnimationPaintInfo {
		const { rect, json } = this.view;
		return {
			firstFrame: new Date().getTime(),
			rect: rect.toXYWHRect(),
			animation: CanvasKit.MakeAnimation(JSON.stringify(json))
		};
	}

	private paintWith(paintInfo: AnimationPaintInfo | undefined) {
		if (!paintInfo) return;
		const { firstFrame, rect, animation } = paintInfo;
		const { skCanvas } = this.view.ctx;

		const now = new Date().getTime();
		const seek = ((now - firstFrame) / (animation.duration() * 1000)) % 1;
		animation.seek(seek);
		animation.render(skCanvas, rect);
	}
}
