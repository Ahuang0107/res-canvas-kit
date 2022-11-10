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

	private _scale$ = new BehaviorSubject<number>(1);
	private _position$ = new BehaviorSubject<Point>(new Point(0, 0));

	constructor(private view: CanvasView, private option?: ZoomOption) {
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
		const nextPoint = this.position.minus(offset);
		if (this.option) {
			if (this.option.xMin) {
				nextPoint.x = Math.min(nextPoint.x, this.option.xMin);
			}
			if (this.option.xMax) {
				nextPoint.x = Math.max(nextPoint.x, this.option.xMax);
			}
			if (this.option.yMin) {
				nextPoint.y = Math.min(nextPoint.y, this.option.yMin);
			}
			if (this.option.yMax) {
				nextPoint.y = Math.max(nextPoint.x, this.option.yMax);
			}
		}
		this._position$.next(nextPoint);
	}

	private onWheel = (_e: Event) => {
		const e = _e as WheelEvent;

		e.preventDefault();
		const offset = this.getOffsetDelta(e);
		this.view.pageState.moveLayerView?.offset(offset.x, offset.y);
		this.onOffset(offset);
	};

	private getOffsetDelta(e: WheelEvent): Point {
		if (bowser.windows && e.shiftKey) {
			return new Point(e.deltaY, 0);
		}
		return new Point(e.deltaX, e.deltaY);
	}
}
