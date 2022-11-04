import { BehaviorSubject, merge, Observable } from 'rxjs';
import { Point } from '../base/point';
import { IZoomListener } from './i-zoom-listener';
import { CanvasKit } from '../utils';

interface ZoomOption {
	yBelowOrigin?: boolean;
	xBelowOrigin?: boolean;
}

export class ZoomState implements IZoomListener {
	public scale$ = new BehaviorSubject<number>(1);
	changed$: Observable<unknown>;
	private _position$ = new BehaviorSubject<Point>(new Point(0, 0));

	constructor(
		private option: ZoomOption = {
			yBelowOrigin: true,
			xBelowOrigin: true
		}
	) {
		this.changed$ = merge(this._position$, this.scale$);
	}

	get position() {
		return this._position$.value;
	}

	get scale() {
		return this.scale$.value;
	}

	// 应用了 position、scale 后相当于这个 matrix
	get matrix() {
		return CanvasKit.Matrix.multiply(
			CanvasKit.Matrix.translated(this.position.x, this.position.y),
			CanvasKit.Matrix.scaled(this.scale, this.scale)
		);
	}

	get interMatrix() {
		return CanvasKit.Matrix.invert(this.matrix)!;
	}

	onOffset(offset: Point): void {
		/**
		 * 这里专门针对retain表格渲染增加了不能移动到原点更上方的逻辑
		 * todo 这里最好应该是对page设置frame的限制，然后移动时保持offset在这个限制之内
		 */
		const nextPoint = this.position.minus(offset);
		if (!this.option.yBelowOrigin) {
			if (nextPoint.y > 0) {
				nextPoint.y = 0;
			}
		}
		this._position$.next(nextPoint);
	}

	setPosition(pt: Point) {
		this._position$.next(pt);
	}
}
