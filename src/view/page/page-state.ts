import { merge, Subject } from 'rxjs';
import { BaseView } from '../base/base-view';

export class PageState {
	// todo focus的逻辑需要调整，支持同时选中多个元素
	focusLayerView?: BaseView;
	hoverLayerView?: BaseView;
	moveLayerView?: BaseView;

	focusChange = new Subject();
	hoverChange = new Subject();
	moveChange = new Subject();

	changed = merge(this.focusChange, this.hoverChange, this.moveChange);

	reset() {
		// todo 默认移动时之前的hover失效，但是focus不失效
		// this.focusLayer(undefined);
		this.hoverLayer(undefined);
		// this.moveLayer(undefined);
	}

	focusLayer(view: BaseView | undefined) {
		if (this.focusLayerView?.id === view?.id) return;
		if (this.focusLayerView) {
			this.focusLayerView.z = 0;
		}
		this.focusLayerView = view;
		if (this.focusLayerView) {
			this.focusLayerView.z = 1;
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
			this.moveLayerView.z = 1;
		}
		this.moveChange.next();
	}
}
