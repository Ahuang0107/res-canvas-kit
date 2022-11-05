import { Disposable } from '../base/disposable';
import { IZoomListener } from './i-zoom-listener';
import { fromEvent } from 'rxjs';
import bowser from 'bowser';
import { Point } from '../base/point';

export class ZoomController extends Disposable {
	private offset = new Point();

	constructor(private el: HTMLCanvasElement, private service: IZoomListener) {
		super();
		this._disposables.push(fromEvent(this.el, 'wheel').subscribe(this.onWheel));
	}

	// todo 鼠标滚动时，也需要调整当前处于move状态的view
	private onWheel = (_e: Event) => {
		const e = _e as WheelEvent;

		e.preventDefault();
		if (e.ctrlKey || e.metaKey) {
			const scaleMultiply = (100 - 1.5 * this.getScaleDelta(e)) / 100;
			// this.service.onScale(scaleMultiply, new Point(e.offsetX - this.offset.x, e.offsetY - this.offset.x));
		} else {
			this.service.onOffset(this.getOffsetDelta(e));
		}
	};

	private getScaleDelta(e: WheelEvent): number {
		if (e.deltaMode === 1) {
			return e.deltaY * 15;
		} else if (e.deltaY < 20 && e.deltaY > -20) {
			return e.deltaY;
		} else {
			return Math.max(Math.min(e.deltaY, 20), -20);
		}
	}

	private getOffsetDelta(e: WheelEvent): Point {
		if (bowser.windows && e.shiftKey) {
			return new Point(e.deltaY, 0);
		}
		return new Point(e.deltaX, e.deltaY);
	}
}
