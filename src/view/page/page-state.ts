import { merge, Subject } from 'rxjs';
import { BaseLayerView } from '../base/base-layer-view';

export class PageState {
	selectedLayerView?: BaseLayerView;
	hoverLayerView?: BaseLayerView;

	selectionChange = new Subject();
	hoverChange = new Subject();

	changed = merge(this.selectionChange, this.hoverChange);

	reset() {
		this.selectLayer(undefined);
		this.hoverLayer(undefined);
	}

	selectLayer(view: BaseLayerView | undefined) {
		if (this.selectedLayerView === view) return;
		this.selectedLayerView = view;
		this.selectionChange.next();
	}

	hoverLayer(view: BaseLayerView | undefined) {
		if (this.hoverLayerView === view) return;
		this.hoverLayerView = view;
		this.hoverChange.next();
	}
}
