import {Disposable} from '../base/disposable';
import {Point} from '../base/point';
import {fromEvent} from 'rxjs';
import {throttleTime} from 'rxjs/operators';
import {CanvasView} from '../view/canvas-view';
import {BaseView, stretchArea, stretchLeft, stretchRight} from '../view/base/base-view';
import {EventSupport} from '../view/base/event-support';
import {StretchDirection} from '../view/base/stretch-direction';
import {rectOffset} from '../base/rect';

// todo 交互事件一般伴随着更新后端数据，此时可能网络请求失败，需要进行回退操作，或者说网络请求成功时才进行
// todo 增加cut事件，比如鼠标移动到列的竖线上时可以进行裁切，然后将当前的focus的所有view都进行裁切
// todo 当有多个view被选中并进行stretch时，如果各个stretch长度是不同的，那么移动时先到限制的view就不能stretch了，但是其他的view依旧可以stretch，然后再移动回来时就变成一样长了，操作就变成不可逆的了
export class PointerController extends Disposable {
	lastMousePos: Point = new Point();
	lastMouseDownPos: Point = new Point();

	constructor(private view: CanvasView) {
		super();

		view.canvasEl$.subscribe((el) => {
			const canvasEl = el;

			this._disposables.push(
				fromEvent(canvasEl, 'mousemove').pipe(throttleTime(10)).subscribe(this.onMousemove)
			);
			this._disposables.push(fromEvent(canvasEl, 'mousedown').subscribe(this.onMousedown));
			this._disposables.push(fromEvent(canvasEl, 'mouseup').subscribe(this.onMouseup));

			this._disposables.push(fromEvent(document, 'keydown').subscribe(this.onDeleteKey));
		});
	}

	// mousemove时需要根据当前stage来判断需要进行什么操作
	onMousemove = (_event: Event) => {
		const event = _event as MouseEvent;
		// 当moveLayerView非空时，鼠标移动意味着正在移动View
		if (this.view.pageState.moving) {
			this.onViewMove(event);
			return;
		}
		// 当stretchLayerView非空时，鼠标移动意味着正在拉伸View
		if (this.view.pageState.stretchDirection !== undefined) {
			this.onViewStretch(event);
			return;
		}
		this.onHover(event);
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
				if (stretchArea(targetView, StretchDirection.LEFT)?.containsPoint(worldPt)) {
					document.body.style.cursor = 'col-resize';
				} else if (stretchArea(targetView, StretchDirection.RIGHT)?.containsPoint(worldPt)) {
					document.body.style.cursor = 'col-resize';
				} else if (stretchArea(targetView, StretchDirection.TOP)?.containsPoint(worldPt)) {
					document.body.style.cursor = 'row-resize';
				} else if (stretchArea(targetView, StretchDirection.BOTTOM)?.containsPoint(worldPt)) {
					document.body.style.cursor = 'row-resize';
				} else {
					document.body.style.cursor = '';
				}
			}
		} else {
			document.body.style.cursor = '';
		}

		if (!targetView) {
			this.view.pageState.hoverEmptyCell(pt);
		} else {
			this.view.pageState.hoverEmptyCell();
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
			if (targetView) {
				if (stretchArea(targetView, StretchDirection.LEFT)?.containsPoint(worldPt)) {
					sd = StretchDirection.LEFT;
				} else if (stretchArea(targetView, StretchDirection.RIGHT)?.containsPoint(worldPt)) {
					sd = StretchDirection.RIGHT;
				} else if (stretchArea(targetView, StretchDirection.TOP)?.containsPoint(worldPt)) {
					sd = StretchDirection.TOP;
				} else if (stretchArea(targetView, StretchDirection.BOTTOM)?.containsPoint(worldPt)) {
					sd = StretchDirection.BOTTOM;
				}
			}
			if (sd !== undefined) {
				document.body.style.cursor = 'col-resize';
				this.view.pageState.stretchLayer(sd);
			} else {
				document.body.style.cursor = 'grabbing';
				this.view.pageState.moveLayer(true);
			}
		}
		this.lastMousePos = pt;
		this.lastMouseDownPos = pt;
	};

	onViewMove(event: MouseEvent) {
		if (this.view.pageState.moving) {
			const mousePos = new Point(event.offsetX, event.offsetY);
			const offset = mousePos.compare(this.lastMousePos);
			this.view.pageState.focusingViews.forEach((v) => {
				rectOffset(v.frame, offset.x, offset.y);
			});
			this.view.markDirty();
		}
		this.lastMousePos = new Point(event.offsetX, event.offsetY);
	}

	onViewStretch(event: MouseEvent) {
		if (!this.view.currentPage) return;
		if (this.view.pageState.stretchDirection === undefined) return;
		const { offsetX, offsetY } = event;
		const pt = new Point(offsetX, offsetY);
		const offset = pt.compare(this.lastMousePos);
		if (this.view.pageState.stretchDirection === StretchDirection.LEFT) {
			this.view.pageState.focusingViews.forEach((v) => {
				stretchLeft(v, -offset.x);
			});
		} else if (this.view.pageState.stretchDirection === StretchDirection.RIGHT) {
			this.view.pageState.focusingViews.forEach((v) => {
				stretchRight(v, offset.x);
			});
		}
		this.view.markDirty();
		this.lastMousePos = pt;
	}

	onMouseup = (_event: Event) => {
		if (!this.view.currentPage) return;
		const event = _event as MouseEvent;
		const { offsetX, offsetY, ctrlKey } = event;
		// 鼠标相对canvas的坐标
		const pt = new Point(offsetX, offsetY);

		if (this.lastMouseDownPos.x === pt.x && this.lastMouseDownPos.y === pt.y) {
			const targetView = this.findView(pt, { focus: true });
			if (!targetView) {
				document.body.style.cursor = '';
			}
			this.view.pageState.focusView(targetView, ctrlKey);
		}

		this.view.pageState.moveLayer(false);
		this.view.pageState.stretchLayer(undefined);
		document.body.style.cursor = '';
	};

	onDeleteKey = (_event: Event) => {
		const event = _event as KeyboardEvent;
		if (event.key === 'Delete' && this.view.pageState.focusingViews.length > 0) {
			this.view.pageState.focusingViews.forEach((v) => {
				if (v.es.delete) {
					this.view.currentPage?.delete(v);
				}
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
