import { merge, Subject } from 'rxjs';
import { BaseView } from '../base/base-view';
import { StretchDirection } from '../base/stretch-direction';

export class PageState {
	focusingViews: BaseView[] = [];
	hoverView?: BaseView;
	moveView?: BaseView;
	stretchView?: BaseView;
	stretchDirection?: StretchDirection;

	focusChange = new Subject();
	hoverChange = new Subject();
	moveChange = new Subject();
	stretchChange = new Subject();

	changed = merge(this.focusChange, this.hoverChange, this.moveChange, this.stretchChange);

	reset() {
		// todo 默认移动时之前的hover失效，但是focus不失效
		// this.focusLayer(undefined);
		this.hoverLayer(undefined);
		// this.moveLayer(undefined);
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

	moveLayer(view: BaseView | undefined) {
		if (this.moveView?.id === view?.id) return;
		this.moveView = view;
		this.moveChange.next();
	}

	stretchLayer(view: BaseView | undefined, directions?: StretchDirection) {
		if (this.stretchView?.id === view?.id) return;
		this.stretchView = view;
		this.stretchDirection = directions;
		this.stretchChange.next();
	}
}
