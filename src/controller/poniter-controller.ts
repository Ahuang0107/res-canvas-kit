import { Disposable } from '../base/disposable';
import invariant from 'ts-invariant';
import { PageView } from '../view/page/page-view';
import { Point } from '../base/point';
import { BaseLayerView } from '../view/base/base-layer-view';
import { fromEvent } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { CanvasView } from '../view/canvas-view';

export class PointerController extends Disposable {
	constructor(private view: CanvasView) {
		super();

		view.canvasEl$.subscribe((el) => {
			const canvasEl = el;

			this._disposables.push(
				fromEvent(canvasEl, 'mousemove')
					.pipe(throttleTime(10))
					.subscribe((event) => {
						this.onHover(event as MouseEvent);
					})
			);

			this._disposables.push(fromEvent(canvasEl, 'click').subscribe(this.onClick));
		});
	}

	onClick = (_event: Event) => {
		const event = _event as MouseEvent;

		const targetView = this.findViewFromEvent(event);
		this.view.selectLayer(targetView);
	};

	onHover(event: MouseEvent) {
		const targetView = this.findViewFromEvent(event);
		this.view.hoverLayer(targetView);
	}

	findViewFromEvent(event: MouseEvent) {
		const { offsetX, offsetY } = event;
		const pt = new Point(offsetX, offsetY);

		// const start = Date.now();
		const targetView = this.findView(pt);
		// const cost = Date.now() - start;
		// console.log('Find view', cost, offsetX, offsetY, targetView);

		invariant(!(targetView instanceof PageView), 'Cant select page view. It should be undefined');
		return targetView;
	}

	/**
	 * @param pt 相对 canvas 的坐标
	 */
	findView(pt: Point): BaseLayerView | undefined {
		const pageView = this.view.pageView;
		if (!pageView) return;

		// if (!pageView.containsPoint(pt)) return;

		return this.findViewFirst(pageView, pt);
	}

	private findViewFirst(pageView: PageView, pt: Point): BaseLayerView | undefined {
		for (let i = pageView.absoluteChildren.length - 1; i >= 0; i--) {
			const layer = pageView.absoluteChildren[i];
			if (layer.enableHover && layer.containsPoint(pt, 0, 0)) {
				return layer;
			}
		}
		for (let i = pageView.xAbsoluteChildren.length - 1; i >= 0; i--) {
			const layer = pageView.xAbsoluteChildren[i];
			if (layer.enableHover && layer.containsPoint(pt, 0)) {
				return layer;
			}
		}
		for (let i = pageView.yAbsoluteChildren.length - 1; i >= 0; i--) {
			const layer = pageView.yAbsoluteChildren[i];
			if (layer.enableHover && layer.containsPoint(pt, undefined, 0)) {
				return layer;
			}
		}
		for (let i = pageView.children.length - 1; i >= 0; i--) {
			const layer = pageView.children[i];
			if (layer.enableHover && layer.containsPoint(pt)) {
				return layer;
			}
		}
		return undefined;
	}
}
