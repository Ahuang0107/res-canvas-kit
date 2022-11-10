import { Disposable } from '../base/disposable';
import invariant from 'ts-invariant';
import { Page } from '../view/page/page';
import { Point } from '../base/point';
import { fromEvent } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { CanvasView } from '../view/canvas-view';
import { BaseView } from '../view/base/base-view';

export class PointerController extends Disposable {
	lastMousePos: Point = new Point();

	constructor(private view: CanvasView) {
		super();

		view.canvasEl$.subscribe((el) => {
			const canvasEl = el;

			this._disposables.push(
				fromEvent(canvasEl, 'mousemove')
					.pipe(throttleTime(10))
					.subscribe((event) => {
						this.onHover(event as MouseEvent);
						this.onViewMove(event as MouseEvent);
					})
			);

			this._disposables.push(fromEvent(canvasEl, 'click').subscribe(this.onClick));
			this._disposables.push(fromEvent(canvasEl, 'mousedown').subscribe(this.onMousedown));
			this._disposables.push(fromEvent(canvasEl, 'mouseup').subscribe(this.onMouseup));
		});
	}

	onClick = (_event: Event) => {
		const event = _event as MouseEvent;

		const targetView = this.findViewFromEvent(event);
		this.view.pageState.focusLayer(targetView);
	};

	onHover(event: MouseEvent) {
		const targetView = this.findViewFromEvent(event);
		this.view.pageState.hoverLayer(targetView);
	}

	onMousedown = (_event: Event) => {
		const event = _event as MouseEvent;

		const targetView = this.findViewFromEvent(event);
		if (targetView?.id === this.view.pageState.focusLayerView?.id) {
			this.view.pageState.moveLayer(targetView);
		}
		this.lastMousePos = new Point(event.offsetX, event.offsetY);
	};

	onViewMove(event: MouseEvent) {
		if (this.view.pageState.moveLayerView) {
			const mousePos = new Point(event.offsetX, event.offsetY);
			const offset = mousePos.compare(this.lastMousePos);
			this.view.pageState.moveLayerView.offset(offset.x, offset.y);
			this.view.markDirty();
		}
		this.lastMousePos = new Point(event.offsetX, event.offsetY);
	}

	onMouseup = () => {
		this.view.pageState.moveLayer(undefined);
	};

	findViewFromEvent(event: MouseEvent) {
		const { offsetX, offsetY } = event;
		const pt = new Point(offsetX, offsetY);

		const targetView = this.findView(pt);

		invariant(!(targetView instanceof Page), 'Cant select page view. It should be undefined');
		return targetView;
	}

	/**
	 * @param pt 相对 canvas 的坐标
	 */
	findView(pt: Point): BaseView | undefined {
		const pageView = this.view.currentPage;
		if (!pageView) return;

		// if (!pageView.containsPoint(pt)) return;

		return this.findViewFirst(pageView, pt);
	}

	private findViewFirst(pageView: Page, pt: Point): BaseView | undefined {
		const hoverViews = [];
		let maxZ = 0;
		let hoverView = undefined;
		for (let i = pageView.fixedViews.length - 1; i >= 0; i--) {
			const layer = pageView.fixedViews[i];
			if (layer.containsPoint(pt, 0, 0)) {
				maxZ = Math.max(maxZ, layer.z);
				hoverViews.push(layer);
			}
		}
		hoverView = hoverViews.find((v) => v.z == maxZ);
		if (hoverView) {
			return hoverView;
		}
		for (let i = pageView.xFixedViews.length - 1; i >= 0; i--) {
			const layer = pageView.xFixedViews[i];
			if (layer.containsPoint(pt, 0)) {
				maxZ = Math.max(maxZ, layer.z);
				hoverViews.push(layer);
			}
		}
		hoverView = hoverViews.find((v) => v.z == maxZ);
		if (hoverView) {
			return hoverView;
		}
		for (let i = pageView.yFixedViews.length - 1; i >= 0; i--) {
			const layer = pageView.yFixedViews[i];
			if (layer.containsPoint(pt, undefined, 0)) {
				maxZ = Math.max(maxZ, layer.z);
				hoverViews.push(layer);
			}
		}
		hoverView = hoverViews.find((v) => v.z == maxZ);
		if (hoverView) {
			return hoverView;
		}
		for (let i = pageView.views.length - 1; i >= 0; i--) {
			const layer = pageView.views[i];
			if (layer.containsPoint(pt)) {
				maxZ = Math.max(maxZ, layer.z);
				hoverViews.push(layer);
			}
		}
		hoverView = hoverViews.find((v) => v.z == maxZ);
		return hoverView;
	}
}
