import { BaseView } from './base-view';
import { Point } from '../../base/point';
import { Rect } from '../../base/rect';

export abstract class BaseLayerView extends BaseView {
	enableHover = false;

	protected constructor(public frame: Rect) {
		super();
	}

	render() {
		const { skCanvas } = this.ctx;
		skCanvas.save();
		this._render();
		skCanvas.restore();
	}

	abstract _render(): void;

	containsPoint(pt: Point, offsetX?: number, offsetY?: number): boolean {
		if (!this.ctx.pageView) return false;
		const offset = this.ctx.pageView.transform.position;
		return this.frame.containsPoint(pt.minus(new Point(offsetX ?? offset.x, offsetY ?? offset.y)));
	}
}
