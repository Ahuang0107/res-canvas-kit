import { BaseView } from '../base/base-view';
import { ComponentCaches } from '../base/cache';
import { buildCell, CellConfig } from './cell-util';
import { Rect } from '../../base/rect';

export class CellView extends BaseView {
	constructor(frame: Rect, private config: CellConfig) {
		super(frame);
	}

	build(): ComponentCaches {
		return buildCell(this.frame, this.config);
	}

	_render(): void {
		const { skCanvas } = this.ctx;
		this.caches?.cache.forEach((cache) => {
			cache.draw(skCanvas);
		});
	}

	_hoverRender(): void {
		const { skCanvas } = this.ctx;
		(this.caches.hoverCache ?? this.caches.cache).forEach((cache) => {
			cache.draw(skCanvas);
		});
	}

	_focusRender() {
		const { skCanvas } = this.ctx;
		(this.caches.focusCache ?? this.caches.cache).forEach((cache) => {
			cache.draw(skCanvas);
		});
	}
}
