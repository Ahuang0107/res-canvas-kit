import { BaseView } from './base-view';
import { Rect } from '../../base/rect';
import { AnimaCache, ComponentCaches } from './cache';
import json from '../../assets/lotties/8370-loading.json';

export class AnimaView extends BaseView {
	json: never;

	constructor() {
		super(new Rect(0, 0, 500, 500));
		this.json = json as never;
	}

	static new(): AnimaView {
		return new AnimaView();
	}

	resize() {
		const canvasFrame = this.ctx.frame;
		this.frame.x = (canvasFrame.width - this.frame.width) / 2;
		this.frame.y = (canvasFrame.height - this.frame.height) / 2;
	}

	protected build(): ComponentCaches {
		this.resize();
		return { cache: [new AnimaCache(this.frame, this.json)] };
	}
}
