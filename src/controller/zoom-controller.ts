import { Disposable } from '../base/disposable';
import { BehaviorSubject, fromEvent, merge, Observable } from 'rxjs';
import bowser from 'bowser';
import { Point } from '../base/point';
import { CanvasView } from '../view/canvas-view';

export interface ZoomOption {
	xMin?: number;
	xMax?: number;
	yMin?: number;
	yMax?: number;
}

export class ZoomController extends Disposable {
	changed$: Observable<unknown>;
	option: ZoomOption = {};
	private _scale$ = new BehaviorSubject<number>(1);
	private _position$ = new BehaviorSubject<Point>(new Point(0, 0));

	constructor(private view: CanvasView) {
		super();
		this.changed$ = merge(this._position$, this._scale$);
		this._disposables.push(
			this.changed$.subscribe(() => {
				this.view.pageState.reset();
				this.view.markDirty();
			})
		);
		view.canvasEl$.subscribe((el) => {
			// todo 创建新的page时，这里subscribe的event需要unsubscribe，不然event会call twice
			this._disposables.push(fromEvent(el, 'wheel').subscribe(this.onWheel));
		});
	}

	get position() {
		return this._position$.value;
	}

	onOffset(offset: Point): void {
		// nextPoint 指可见screen相对于origin的位置，screen向下移动时，nextPoint.y是负数
		const nextPoint = this.position.minus(offset);
		if (this.option) {
			if (this.option.xMin != undefined && -nextPoint.x < this.option.xMin) {
				nextPoint.x = -this.option.xMin;
			}
			if (this.option.xMax != undefined && -nextPoint.x > this.option.xMax) {
				nextPoint.x = -this.option.xMax;
			}
			if (this.option.yMin != undefined && -nextPoint.y < this.option.yMin) {
				nextPoint.y = -this.option.yMin;
			}
			if (this.option.yMax != undefined && -nextPoint.y > this.option.yMax) {
				nextPoint.y = -this.option.yMax;
			}
		}
		this._position$.next(nextPoint);
	}

	private onWheel = (_e: Event) => {
		const e = _e as WheelEvent;

		e.preventDefault();
		const offset = this.getOffsetDelta(e);
		this.view.pageState.moveView?.offset(offset.x, offset.y);
		this.onOffset(offset);
	};

	private getOffsetDelta(e: WheelEvent): Point {
		if (bowser.windows && e.shiftKey) {
			return new Point(e.deltaY, 0);
		}
		return new Point(e.deltaX, e.deltaY);
	}
}
