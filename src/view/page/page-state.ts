import { merge, Subject } from 'rxjs';
import { BaseView } from '../base/base-view';

export class PageState {
	// todo focus的逻辑需要调整，支持同时选中多个元素
	focusLayerView?: BaseView;
	hoverLayerView?: BaseView;
	moveLayerView?: BaseView;
	stretchLayerView?: BaseView;
	stretchDirection?: boolean[] = [false, false];

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
		if (this.focusLayerView?.id === view?.id) return;
		if (this.focusLayerView) {
			this.focusLayerView.z = 10;
		}
		this.focusLayerView = view;
		if (this.focusLayerView) {
			this.focusLayerView.z = 100;
		}
		this.focusChange.next();
	}

	hoverLayer(view: BaseView | undefined) {
		if (this.hoverLayerView?.id === view?.id) return;
		this.hoverLayerView = view;
		this.hoverChange.next();
	}

	moveLayer(view: BaseView | undefined) {
		if (this.moveLayerView?.id === view?.id) return;
		this.moveLayerView = view;
		if (this.moveLayerView) {
			this.moveLayerView.z = 100;
		}
		this.moveChange.next();
	}

	/**
	 *
	 * @param view
	 * @param directions true表示stretch的方向是left，false表示stretch的方向是right
	 */
	stretchLayer(view: BaseView | undefined, directions?: boolean[]) {
		if (this.stretchLayerView?.id === view?.id) return;
		this.stretchLayerView = view;
		if (this.stretchLayerView) {
			this.stretchLayerView.z = 100;
		}
		this.stretchDirection = directions;
		this.stretchChange.next();
	}
}
