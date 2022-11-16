import { merge, Subject } from 'rxjs';
import { BaseView } from '../base/base-view';
import { StretchDirection } from '../base/stretch-direction';

export class PageState {
	focusingViews: BaseView[] = [];
	hoverView?: BaseView;
	// true 表示正在move view
	moving = false;
	// 不为undefined 表示正在stretch view
	stretchDirection?: StretchDirection;

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

	hoverLayer(view: BaseView | undefined) {
		if (this.hoverView?.id === view?.id) return;
		this.hoverView = view;
		this.hoverChange.next();
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
