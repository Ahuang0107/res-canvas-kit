import { Disposable } from '../base/disposable';
import { Point } from '../base/point';
import { fromEvent } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { CanvasView } from '../view/canvas-view';
import { BaseView } from '../view/base/base-view';
import { EventSupport } from '../view/base/event-support';
import { StretchDirection } from '../view/base/stretch-direction';

export class PointerController extends Disposable {
	lastMousePos: Point = new Point();

	constructor(private view: CanvasView) {
		super();

		view.canvasEl$.subscribe((el) => {
			const canvasEl = el;

			this._disposables.push(
				fromEvent(canvasEl, 'mousemove').pipe(throttleTime(10)).subscribe(this.onMousemove)
			);

			this._disposables.push(fromEvent(canvasEl, 'click').subscribe(this.onClick));
			this._disposables.push(fromEvent(canvasEl, 'mousedown').subscribe(this.onMousedown));
			this._disposables.push(fromEvent(canvasEl, 'mouseup').subscribe(this.onMouseup));

			this._disposables.push(fromEvent(document, 'keydown').subscribe(this.onDeleteKey));
		});
	}

	// mousemove时需要根据当前stage来判断需要进行什么操作
	onMousemove = (_event: Event) => {
		const event = _event as MouseEvent;
		// 当moveLayerView非空时，鼠标移动意味着正在移动View
		if (this.view.pageState.moveView) {
			this.onViewMove(event);
			return;
		}
		// 当stretchLayerView非空时，鼠标移动意味着正在拉伸View
		if (this.view.pageState.stretchView) {
			this.onViewStretch(event);
			return;
		}
		this.onHover(event);
	};

	onClick = (_event: Event) => {
		const event = _event as MouseEvent;
		const { offsetX, offsetY, ctrlKey } = event;
		const pt = new Point(offsetX, offsetY);
		const targetView = this.findView(pt, { focus: true });
		if (!targetView) {
			document.body.style.cursor = '';
		}

		this.view.pageState.focusView(targetView, ctrlKey);
		console.log(this.view.pageState.focusingViews);
	};

	onHover(event: MouseEvent) {
		if (!this.view.currentPage) return;
		const { offsetX, offsetY } = event;
		// 鼠标相对canvas的坐标
		const pt = new Point(offsetX, offsetY);
		const offset = this.view.currentPage?.transform.position;
		// 鼠标相对world的坐标
		const worldPt = pt.minus(new Point(offset.x, offset.y));
		const targetView = this.findView(pt, { hover: true });

		// 当hover的view是当前focus的view，并且是CellView时，当pointer位置在两边时，pointer显示为col-resize
		if (this.view.pageState.ifFocus(targetView)) {
			if (targetView?.es.stretch) {
				if (targetView.stretchArea(StretchDirection.LEFT)?.containsPoint(worldPt)) {
					document.body.style.cursor = 'col-resize';
				} else if (targetView.stretchArea(StretchDirection.RIGHT)?.containsPoint(worldPt)) {
					document.body.style.cursor = 'col-resize';
				} else if (targetView.stretchArea(StretchDirection.TOP)?.containsPoint(worldPt)) {
					document.body.style.cursor = 'row-resize';
				} else if (targetView.stretchArea(StretchDirection.BOTTOM)?.containsPoint(worldPt)) {
					document.body.style.cursor = 'row-resize';
				} else {
					document.body.style.cursor = '';
				}
			}
		} else {
			document.body.style.cursor = '';
		}

		this.view.pageState.hoverLayer(targetView);
	}

	onMousedown = (_event: Event) => {
		if (!this.view.currentPage) return;
		const event = _event as MouseEvent;
		const { offsetX, offsetY } = event;
		// 鼠标相对canvas的坐标
		const pt = new Point(offsetX, offsetY);
		const offset = this.view.currentPage?.transform.position;
		// 鼠标相对world的坐标
		const worldPt = pt.minus(new Point(offset.x, offset.y));
		const targetView = this.findView(pt, { move: true, stretch: true });

		// 当mouse down的view是当前focus的view，并且是CellView时，
		if (this.view.pageState.ifFocus(targetView)) {
			let sd: StretchDirection | undefined = undefined;
			if (targetView?.stretchArea(StretchDirection.LEFT)?.containsPoint(worldPt)) {
				sd = StretchDirection.LEFT;
			} else if (targetView?.stretchArea(StretchDirection.RIGHT)?.containsPoint(worldPt)) {
				sd = StretchDirection.RIGHT;
			} else if (targetView?.stretchArea(StretchDirection.TOP)?.containsPoint(worldPt)) {
				sd = StretchDirection.TOP;
			} else if (targetView?.stretchArea(StretchDirection.BOTTOM)?.containsPoint(worldPt)) {
				sd = StretchDirection.BOTTOM;
			}
			if (sd !== undefined) {
				document.body.style.cursor = 'col-resize';
				this.view.pageState.stretchLayer(targetView, sd);
			} else {
				document.body.style.cursor = 'grabbing';
				this.view.pageState.moveLayer(targetView);
			}
		}
		this.lastMousePos = new Point(event.offsetX, event.offsetY);
	};

	onViewMove(event: MouseEvent) {
		if (this.view.pageState.moveView) {
			const mousePos = new Point(event.offsetX, event.offsetY);
			const offset = mousePos.compare(this.lastMousePos);
			this.view.pageState.moveView.offset(offset.x, offset.y);
			this.view.markDirty();
		}
		this.lastMousePos = new Point(event.offsetX, event.offsetY);
	}

	onViewStretch(event: MouseEvent) {
		if (!this.view.currentPage) return;
		if (!this.view.pageState.stretchView) return;
		const { offsetX, offsetY } = event;
		const pt = new Point(offsetX, offsetY);
		const offset = pt.compare(this.lastMousePos);
		if (this.view.pageState.stretchDirection === StretchDirection.LEFT) {
			this.view.pageState.stretchView.stretchLeft(-offset.x);
		} else if (this.view.pageState.stretchDirection === StretchDirection.RIGHT) {
			this.view.pageState.stretchView.stretchRight(offset.x);
		}
		this.view.markDirty();
		this.lastMousePos = pt;
	}

	onMouseup = () => {
		this.view.pageState.moveLayer(undefined);
		this.view.pageState.stretchLayer(undefined);
		document.body.style.cursor = '';
	};

	onDeleteKey = (_event: Event) => {
		const event = _event as KeyboardEvent;
		if (event.key === 'Delete' && this.view.pageState.focusingViews.length > 0) {
			this.view.pageState.focusingViews.forEach((v) => {
				this.view.currentPage?.delete(v);
			});
		}
	};

	/**
	 * @param pt 相对 canvas 的坐标
	 * @param eventSupport
	 */
	protected findView(pt: Point, eventSupport: EventSupport): BaseView | undefined {
		const pageView = this.view.currentPage;
		if (!pageView) return;

		return pageView.findViewTop(pt, eventSupport);
	}
}
