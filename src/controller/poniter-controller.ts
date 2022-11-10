import { Disposable } from '../base/disposable';
import { Point } from '../base/point';
import { fromEvent } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { CanvasView } from '../view/canvas-view';
import { BaseView } from '../view/base/base-view';
import { CellView } from '../view/cell';
import { EventSupport } from '../view/base/event-support';

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
		if (this.view.pageState.moveLayerView) {
			this.onViewMove(event);
			return;
		}
		if (this.view.pageState.stretchLayerView) {
			this.onViewStretch(event);
			return;
		}
		this.onHover(event);
	};

	onClick = (_event: Event) => {
		const event = _event as MouseEvent;
		const { offsetX, offsetY } = event;
		const pt = new Point(offsetX, offsetY);
		const targetView = this.findView(pt, { supportFocus: true });
		if (!targetView) {
			document.body.style.cursor = '';
		}

		this.view.pageState.focusLayer(targetView);
	};

	onHover(event: MouseEvent) {
		const { offsetX, offsetY } = event;
		const pt = new Point(offsetX, offsetY);
		const targetView = this.findView(pt, { supportHover: true });
		// 当hover的view是当前focus的view，并且是CellView时，当pointer位置在两边时，pointer显示为col-resize
		if (targetView?.id === this.view.pageState.focusLayerView?.id) {
			if (targetView instanceof CellView) {
				const [left, right] = targetView.inStretchArea(pt);
				if (left || right) {
					document.body.style.cursor = 'col-resize';
				} else if (!this.view.pageState.moveLayerView) {
					document.body.style.cursor = '';
				}
			}
		} else {
			document.body.style.cursor = '';
		}

		this.view.pageState.hoverLayer(targetView);
	}

	onMousedown = (_event: Event) => {
		const event = _event as MouseEvent;
		const { offsetX, offsetY } = event;
		const pt = new Point(offsetX, offsetY);
		const targetView = this.findView(pt, { supportMove: true, supportStretch: true });

		// 当mouse down的view是当前focus的view，并且是CellView时，
		if (targetView?.id === this.view.pageState.focusLayerView?.id) {
			if (targetView instanceof CellView) {
				const [left, right] = targetView.inStretchArea(pt);
				if (left || right) {
					document.body.style.cursor = 'col-resize';
					this.view.pageState.stretchLayer(targetView, [left, right]);
				} else {
					document.body.style.cursor = 'grabbing';
					this.view.pageState.moveLayer(targetView);
				}
			}
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

	onViewStretch(event: MouseEvent) {
		if (
			this.view.pageState.stretchLayerView instanceof CellView &&
			this.view.pageState.stretchDirection
		) {
			const mousePos = new Point(event.offsetX, event.offsetY);
			const offset = mousePos.compare(this.lastMousePos);
			const [left] = this.view.pageState.stretchDirection;
			if (left) {
				this.view.pageState.stretchLayerView.stretchLeft(-offset.x);
			} else {
				this.view.pageState.stretchLayerView.stretchRight(offset.x);
			}
			this.view.markDirty();
		}
		this.lastMousePos = new Point(event.offsetX, event.offsetY);
	}

	onMouseup = () => {
		this.view.pageState.moveLayer(undefined);
		this.view.pageState.stretchLayer(undefined);
		document.body.style.cursor = '';
	};

	onDeleteKey = (_event: Event) => {
		const event = _event as KeyboardEvent;
		if (event.key === 'Delete' && this.view.pageState.focusLayerView) {
			this.view.currentPage?.delete(this.view.pageState.focusLayerView);
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
