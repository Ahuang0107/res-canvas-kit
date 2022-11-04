import { ZoomState } from '../../controller/zoom-state';
import { ZoomController } from '../../controller/zoom-controller';
import { BaseLayerView } from '../base/base-layer-view';
import { Rect } from '../../base/rect';
import { Transform } from '../../base/transform';

export class PageView extends BaseLayerView {
	zoomState: ZoomState;
	controller!: ZoomController;
	transform = new Transform();
	children: BaseLayerView[] = [];
	absoluteChildren: BaseLayerView[] = [];
	xAbsoluteChildren: BaseLayerView[] = [];
	yAbsoluteChildren: BaseLayerView[] = [];

	constructor() {
		super(new Rect());
		this.zoomState = new ZoomState({
			yBelowOrigin: false
		});
		this.initController();
	}

	push<T extends BaseLayerView>(views: T[]) {
		this.children.push(...views);
	}

	pushA<T extends BaseLayerView>(views: T[]) {
		this.absoluteChildren.push(...views);
	}

	pushAX<T extends BaseLayerView>(views: T[]) {
		this.xAbsoluteChildren.push(...views);
	}

	pushAY<T extends BaseLayerView>(views: T[]) {
		this.yAbsoluteChildren.push(...views);
	}

	_render() {
		const { skCanvas } = this.ctx;
		const { position } = this.zoomState;

		let saveCount;
		/* 先渲染中间的内容，因为其他三个部分都要覆盖在上面*/
		saveCount = skCanvas.save();
		this.transform.position.set(position.x, position.y);
		this.transform.updateLocalTransform();
		skCanvas.concat(this.transform.localTransform.toArray(false));
		this.children.forEach((child) => {
			child.render();
		});
		skCanvas.restoreToCount(saveCount);

		saveCount = skCanvas.save();
		this.transform.position.set(position.x, 0);
		this.transform.updateLocalTransform();
		skCanvas.concat(this.transform.localTransform.toArray(false));
		this.yAbsoluteChildren.forEach((child) => {
			child.render();
		});
		skCanvas.restoreToCount(saveCount);

		saveCount = skCanvas.save();
		this.transform.position.set(0, position.y);
		this.transform.updateLocalTransform();
		skCanvas.concat(this.transform.localTransform.toArray(false));
		this.xAbsoluteChildren.forEach((child) => {
			child.render();
		});
		skCanvas.restoreToCount(saveCount);

		this.absoluteChildren.forEach((child) => {
			child.render();
		});

		/* 最后还是要记得将offset设置回正确的值 */
		this.transform.position.set(position.x, position.y);
		this.transform.updateLocalTransform();
		skCanvas.concat(this.transform.localTransform.toArray(false));
	}

	private initController() {
		// todo, add to dispose
		this.ctx.canvasEl$.subscribe((el) => {
			this.controller = new ZoomController(el!, this.zoomState);
		});

		this.zoomState.changed$.subscribe(() => {
			this.ctx.pageState.reset();
			this.ctx.markDirty();
		});
	}
}
