import { merge, Subject } from 'rxjs';
import { BaseView } from '../base/base-view';
import { StretchDirection } from '../base/stretch-direction';

export class PageState {
	// todo focus的逻辑需要调整，支持同时选中多个元素
	focusView?: BaseView;
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

	focusLayer(view: BaseView | undefined) {
		if (this.focusView?.id === view?.id) return;
		if (this.focusView) {
			this.focusView.z = 10;
		}
		this.focusView = view;
		if (this.focusView) {
			this.focusView.z = 100;
		}
		this.focusChange.next();
	}

	hoverLayer(view: BaseView | undefined) {
		if (this.hoverView?.id === view?.id) return;
		this.hoverView = view;
		this.hoverChange.next();
	}

	moveLayer(view: BaseView | undefined) {
		if (this.moveView?.id === view?.id) return;
		this.moveView = view;
		if (this.moveView) {
			this.moveView.z = 100;
		}
		this.moveChange.next();
	}

	stretchLayer(view: BaseView | undefined, directions?: StretchDirection) {
		if (this.stretchView?.id === view?.id) return;
		this.stretchView = view;
		if (this.stretchView) {
			this.stretchView.z = 100;
		}
		this.stretchDirection = directions;
		this.stretchChange.next();
	}
}
