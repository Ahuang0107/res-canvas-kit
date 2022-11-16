import { CanvasView } from '../canvas-view';
import { Rect } from '../../base/rect';
import { Point } from '../../base/point';
import { ComponentCaches } from './cache';
import { EventSupport } from './event-support';
import { StretchDirection } from './stretch-direction';

let id = 0;

export abstract class BaseView {
	id: string;
	ctx: CanvasView;
	// 控制该view对交互事件的支持，默认都是false的
	es: EventSupport = {};
	// stretch区域的padding
	sp: (number | undefined)[] = [undefined, undefined, undefined, undefined];

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
	 * 根据stretch direction返回触发对应边stretch的区域
	 * 当不支持stretch事件时返回undefined
	 * 当对应边没有stretch区域时返回undefined
	 * @param sd stretch direction
	 */
	stretchArea(sd: StretchDirection): Rect | undefined {
		if (!this.es.stretch) return;
		if (this.sp[0] !== undefined && sd === StretchDirection.LEFT) {
			return new Rect(this.frame.left, this.frame.top, this.sp[0], this.frame.height);
		} else if (this.sp[1] !== undefined && sd === StretchDirection.RIGHT) {
			return new Rect(this.frame.right - this.sp[1], this.frame.top, this.sp[1], this.frame.height);
		} else if (this.sp[2] !== undefined && sd === StretchDirection.TOP) {
			return new Rect(this.frame.left, this.frame.top, this.frame.width, this.sp[2]);
		} else if (this.sp[3] !== undefined && sd === StretchDirection.BOTTOM) {
			return new Rect(
				this.frame.left,
				this.frame.bottom - this.sp[3],
				this.frame.width,
				this.sp[3]
			);
		}
	}

	/**
	 * 清除原来的caches，当paint信息有修改时调用
	 * 只是frame变化时不需要调用此方法，因为基本render时都是直接使用frame引用的
	 */
	clearCaches() {
		this._caches = undefined;
	}

	render() {
		const { skCanvas } = this.ctx;
		skCanvas.save();
		// 这里需要注意顺序，先判断是否focus再判断hover，因为focus时也一定时hover的
		if (this.ctx.pageState.ifFocus(this)) {
			this._focusRender();
		} else if (this.ctx.pageState.hoverView?.id == this.id) {
			this._hoverRender();
		} else {
			this._render();
		}
		skCanvas.restore();
	}

	// todo 是不是不应该将这个方法放在base view，将判断point是否再rect内的单独拿出来，做多就是需要加上offset
	containsPoint(
		pt: Point,
		eventSupport: EventSupport,
		offsetX?: number,
		offsetY?: number
	): boolean {
		const { hover = false, focus = false, move = false, stretch = false } = eventSupport;
		if (!this.ctx.currentPage) return false;
		if (hover && !this.es.hover) return false;
		if (focus && !this.es.focus) return false;
		if (move && !this.es.move) return false;
		if (stretch && !this.es.stretch) return false;
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

	stretchLeft(offset: number) {
		if (!this.es.stretch) return;
		if (offset > 0) {
			this.frame.x = this.frame.x - offset;
			this.frame.width = this.frame.width + offset;
		} else {
			if (!(this.frame.width + offset < 20)) {
				this.frame.x = this.frame.x - offset;
				this.frame.width = this.frame.width + offset;
			}
		}
	}

	stretchRight(offset: number) {
		if (!this.es.stretch) return;
		if (offset > 0) {
			this.frame.width = this.frame.width + offset;
		} else {
			if (!(this.frame.width + offset < 20)) {
				this.frame.width = this.frame.width + offset;
			}
		}
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
