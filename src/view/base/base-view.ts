import { Rect } from '../../base/rect';
import { Point } from '../../base/point';
import { EventSupport } from './event-support';
import { StretchDirection } from './stretch-direction';
import { CanvasView } from '../canvas-view';

let BaseViewId = 0;

export const getBaseViewId: () => number = () => {
	return BaseViewId++;
};

export enum ViewType {
	Line,
	Cell
}

export type BaseView = {
	id: string;
	type: ViewType;
	frame: Rect;
	es: EventSupport;
	sp: (number | undefined)[];
};

/**
 * 根据stretch direction返回触发对应边stretch的区域
 * 当不支持stretch事件时返回undefined
 * 当对应边没有stretch区域时返回undefined
 * @param view
 * @param sd stretch direction
 */
export function stretchArea(view: BaseView, sd: StretchDirection): Rect | undefined {
	if (!view.es.stretch) return;
	if (view.sp[0] !== undefined && sd === StretchDirection.LEFT) {
		return new Rect(view.frame.left, view.frame.top, view.sp[0], view.frame.h);
	} else if (view.sp[1] !== undefined && sd === StretchDirection.RIGHT) {
		return new Rect(view.frame.right - view.sp[1], view.frame.top, view.sp[1], view.frame.h);
	} else if (view.sp[2] !== undefined && sd === StretchDirection.TOP) {
		return new Rect(view.frame.left, view.frame.top, view.frame.w, view.sp[2]);
	} else if (view.sp[3] !== undefined && sd === StretchDirection.BOTTOM) {
		return new Rect(view.frame.left, view.frame.bottom - view.sp[3], view.frame.w, view.sp[3]);
	}
}

// todo 是不是不应该将这个方法放在base view，将判断point是否再rect内的单独拿出来，做多就是需要加上offset
export function containsPoint(
	view: BaseView,
	pt: Point,
	eventSupport: EventSupport,
	offsetX?: number,
	offsetY?: number
): boolean {
	const { hover = false, focus = false, move = false, stretch = false } = eventSupport;
	if (!CanvasView.currentContext.currentPage) return false;
	if (hover && !view.es.hover) return false;
	if (focus && !view.es.focus) return false;
	if (move && !view.es.move) return false;
	if (stretch && !view.es.stretch) return false;
	const offset = CanvasView.currentContext.currentPage.transform.position;
	return view.frame.containsPoint(pt.minus(new Point(offsetX ?? offset.x, offsetY ?? offset.y)));
}

export function stretchLeft(view: BaseView, offset: number) {
	if (!view.es.stretch) return;
	if (offset > 0) {
		view.frame.x = view.frame.x - offset;
		view.frame.w = view.frame.w + offset;
	} else {
		if (!(view.frame.w + offset < 20)) {
			view.frame.x = view.frame.x - offset;
			view.frame.w = view.frame.w + offset;
		}
	}
}

export function stretchRight(view: BaseView, offset: number) {
	if (!view.es.stretch) return;
	if (offset > 0) {
		view.frame.w = view.frame.w + offset;
	} else {
		if (!(view.frame.w + offset < 20)) {
			view.frame.w = view.frame.w + offset;
		}
	}
}
