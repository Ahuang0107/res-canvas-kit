import { CanvasView } from '../canvas-view';
import { Rect } from '../../base/rect';
import { Point } from '../../base/point';
import { ComponentCaches } from './cache';

let id = 0;

export abstract class BaseView {
	id: string;
	ctx: CanvasView;

	protected constructor(public frame: Rect) {
		this.ctx = CanvasView.currentContext;
		this.id = id.toString();
		id++;
	}

	_caches?: ComponentCaches;

	get caches() {
		if (!this._caches) {
			this._caches = this.build();
		}
		return this._caches;
	}

	flush() {
		this._caches = undefined;
	}

	abstract build(): ComponentCaches;

	render() {
		const { skCanvas } = this.ctx;
		skCanvas.save();
		// 这里需要注意顺序，先判断是否focus再判断hover，因为focus时也一定时hover的
		if (this.ctx.pageState.focusLayerView?.id == this.id) {
			this._focusRender();
		} else if (this.ctx.pageState.hoverLayerView?.id == this.id) {
			this._hoverRender();
		} else {
			this._render();
		}
		skCanvas.restore();
	}

	/**
	 * _render 是一定要实现的具体渲染方法
	 */
	abstract _render(): void;

	/**
	 * _hoverRender 是在hover状态下的渲染方法，默认与_render相同
	 */
	_hoverRender(): void {
		this._render();
	}

	/**
	 * _focusRender 是在选中状态下的渲染方法，默认与_render相同
	 */
	_focusRender(): void {
		this._render();
	}

	containsPoint(pt: Point, offsetX?: number, offsetY?: number): boolean {
		if (!this.ctx.pageView) return false;
		const offset = this.ctx.pageView.transform.position;
		return this.frame.containsPoint(pt.minus(new Point(offsetX ?? offset.x, offsetY ?? offset.y)));
	}

	inScreen(screen: Rect): boolean {
		let result = false;
		[
			this.frame.leftTop,
			this.frame.leftBottom,
			this.frame.rightTop,
			this.frame.rightBottom
		].forEach((p) => {
			result = result || screen.containsPoint(p);
		});
		return result;
	}
}
