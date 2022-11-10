import { ZoomController, ZoomOption } from '../../controller/zoom-controller';
import { Transform } from '../../base/transform';
import { BaseView } from '../base/base-view';
import { CanvasView } from '../canvas-view';
import { info } from '../../utils';

export class Page {
	ctx: CanvasView;
	controller!: ZoomController;
	transform = new Transform();
	autoDirty = false;

	views: BaseView[] = [];
	fixedViews: BaseView[] = [];
	xFixedViews: BaseView[] = [];
	yFixedViews: BaseView[] = [];

	constructor(private option?: ZoomOption) {
		this.ctx = CanvasView.currentContext;
		this.initController(option);
	}

	addViews<T extends BaseView>(views: T[]) {
		this.views.push(...views);
	}

	addFixedViews<T extends BaseView>(views: T[]) {
		this.fixedViews.push(...views);
	}

	addXFixedViews<T extends BaseView>(views: T[]) {
		this.xFixedViews.push(...views);
	}

	addYFixedViews<T extends BaseView>(views: T[]) {
		this.yFixedViews.push(...views);
	}

	prebuild() {
		const start = Date.now();
		this.views.forEach((view) => {
			view.prebuild();
		});
		this.fixedViews.forEach((view) => {
			view.prebuild();
		});
		this.xFixedViews.forEach((view) => {
			view.prebuild();
		});
		this.yFixedViews.forEach((view) => {
			view.prebuild();
		});
		info('page prebuild', `costs: ${Date.now() - start}`);
	}

	render() {
		const start = Date.now();
		const { skCanvas } = this.ctx;
		const { position } = this.controller;
		const { frame } = this.ctx;

		let saveCount;
		/* 先渲染中间的内容，因为其他三个部分都要覆盖在上面*/
		saveCount = skCanvas.save();
		this.transform.position.set(position.x, position.y);
		this.transform.updateLocalTransform();
		skCanvas.concat(this.transform.localTransform.toArray(false));
		const childrenScreen = frame.toOffset(-position.x, -position.y);
		this.views.forEach((child) => {
			if (child.inScreen(childrenScreen)) {
				child.render();
			}
		});
		skCanvas.restoreToCount(saveCount);

		saveCount = skCanvas.save();
		this.transform.position.set(position.x, 0);
		this.transform.updateLocalTransform();
		skCanvas.concat(this.transform.localTransform.toArray(false));
		const yAScreen = frame.toOffset(-position.x, 0);
		this.yFixedViews.forEach((child) => {
			if (child.inScreen(yAScreen)) {
				child.render();
			}
		});
		skCanvas.restoreToCount(saveCount);

		saveCount = skCanvas.save();
		this.transform.position.set(0, position.y);
		this.transform.updateLocalTransform();
		skCanvas.concat(this.transform.localTransform.toArray(false));
		const xAScreen = frame.toOffset(0, -position.y);
		this.xFixedViews.forEach((child) => {
			if (child.inScreen(xAScreen)) {
				child.render();
			}
		});
		skCanvas.restoreToCount(saveCount);

		this.fixedViews.forEach((child) => {
			if (child.inScreen(frame)) {
				child.render();
			}
		});

		/* 最后还是要记得将offset设置回正确的值 */
		this.transform.position.set(position.x, position.y);
		this.transform.updateLocalTransform();
		skCanvas.concat(this.transform.localTransform.toArray(false));
		info('page render', `costs: ${Date.now() - start}`);
	}

	protected initController(option?: ZoomOption) {
		this.controller = new ZoomController(this.ctx, option);
	}
}
