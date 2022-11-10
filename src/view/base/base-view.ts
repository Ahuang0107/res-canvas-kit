import { CanvasView } from '../canvas-view';
import { Rect } from '../../base/rect';
import { Point } from '../../base/point';
import { ComponentCaches } from './cache';
import { EventSupport } from './event-support';

let id = 0;

export abstract class BaseView {
	id: string;
	ctx: CanvasView;
	eventSupport: EventSupport = {
		supportHover: false,
		supportFocus: false,
		supportMove: false,
		supportStretch: false
	};

	protected constructor(public frame: Rect, public z: number = 0) {
		this.ctx = CanvasView.currentContext;
		this.id = id.toString();
		id++;
	}

	protected _caches?: ComponentCaches;

	get caches() {
		this.prebuild();
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return this._caches!;
	}

	/**
	 * 清除原来的caches，当paint信息有修改时调用
	 */
	clearCaches() {
		this._caches = undefined;
	}

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

	containsPoint(
		pt: Point,
		eventSupport: EventSupport,
		offsetX?: number,
		offsetY?: number
	): boolean {
		const {
			supportHover = false,
			supportFocus = false,
			supportMove = false,
			supportStretch = false
		} = eventSupport;
		if (!this.ctx.currentPage) return false;
		if (supportHover && !this.eventSupport.supportHover) return false;
		if (supportFocus && !this.eventSupport.supportFocus) return false;
		if (supportMove && !this.eventSupport.supportMove) return false;
		if (supportStretch && !this.eventSupport.supportStretch) return false;
		const offset = this.ctx.currentPage.transform.position;
		return this.frame.containsPoint(pt.minus(new Point(offsetX ?? offset.x, offsetY ?? offset.y)));
	}

	inScreen(screen: Rect): boolean {
		return screen.intersect(this.frame);
	}

	/**
	 * 预先创建caches信息
	 */
	prebuild() {
		if (!this._caches) {
			this._caches = this.build();
		}
	}

	offset(x: number, y: number) {
		// 这里因为cache直接使用的是frame的引用，所以只需要更新frame然后刷新就行了
		this.frame.offset(x, y);
	}

	protected abstract build(): ComponentCaches;

	protected _render(): void {
		const { skCanvas } = this.ctx;
		this.caches?.cache?.forEach((cache) => {
			cache.draw(skCanvas);
		});
	}

	protected _hoverRender(): void {
		const { skCanvas } = this.ctx;
		(this.caches.hoverCache ?? this.caches.cache)?.forEach((cache) => {
			cache.draw(skCanvas);
		});
	}

	protected _focusRender(): void {
		const { skCanvas } = this.ctx;
		(this.caches.focusCache ?? this.caches.cache)?.forEach((cache) => {
			cache.draw(skCanvas);
		});
	}
}
