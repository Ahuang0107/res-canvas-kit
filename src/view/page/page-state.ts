import { merge, Subject } from 'rxjs';
import { BaseView } from '../base/base-view';
import { StretchDirection } from '../base/stretch-direction';
import { CellView, newCellViewFrom } from '../../plugin/cell/cell-view';
import { Point } from '../../base/point';
import { COLOR } from '../utils';
import { CanvasView } from '../canvas-view';

export class PageState {
	focusingViews: BaseView[] = [];
	hoverView?: BaseView;
	// true 表示正在move view
	moving = false;
	stretchDirection?: StretchDirection;

	hoverCell: CellView[] = [];

	focusChange = new Subject();
	hoverChange = new Subject();
	moveChange = new Subject();
	stretchChange = new Subject();

	changed = merge(this.focusChange, this.hoverChange, this.moveChange, this.stretchChange);

	reset() {
		this.hoverLayer(undefined);
	}

	focusView(view: BaseView | undefined, add = false) {
		if (view) {
			if (add) {
				this.focusingViews.push(view);
			} else {
				this.focusingViews = [];
				this.focusingViews.push(view);
			}
		} else {
			this.focusingViews = [];
		}
		this.focusChange.next();
	}

	ifFocus(view: BaseView | undefined): boolean {
		if (!view) return false;
		const ids = this.focusingViews.map((v) => v.id);
		return ids.includes(view.id);
	}

	ifHover(view: BaseView | undefined): boolean {
		if (!view) return false;
		return view.id === this.hoverView?.id;
	}

	hoverLayer(view: BaseView | undefined) {
		if (this.hoverView?.id === view?.id) return;
		this.hoverView = view;
		this.hoverChange.next();
	}

	hoverEmptyCell(pt?: Point) {
		this.hoverCell = [];
		if (pt) {
			const offset = CanvasView.currentContext.currentPage?.transform.position;
			if (offset) {
				const actualX = pt.x - offset.x;
				const actualY = pt.y - offset.y;
				const floorX = Math.floor(actualX / 32) * 32;
				const floorY = Math.floor(actualY / 24) * 24;
				this.hoverCell.push(
					newCellViewFrom(floorX, floorY, 32, 24, { fillColor: COLOR.SHIRONEZUMI }, {})
				);
				this.hoverChange.next();
			}
		}
	}

	moveLayer(moving: boolean) {
		this.moving = moving;
		this.moveChange.next();
	}

	stretchLayer(directions?: StretchDirection) {
		this.stretchDirection = directions;
		this.stretchChange.next();
	}
}
