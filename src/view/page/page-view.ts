import { ZoomState } from '../../controller/zoom-state';
import { ZoomController } from '../../controller/zoom-controller';
import { Rect } from '../../base/rect';
import { Transform } from '../../base/transform';
import { BaseView } from '../base/base-view';
import { ComponentCaches } from '../base/cache';

export class PageView extends BaseView {
	zoomState: ZoomState;
	controller!: ZoomController;
	transform = new Transform();
	children: BaseView[] = [];
	absoluteChildren: BaseView[] = [];
	xAbsoluteChildren: BaseView[] = [];
	yAbsoluteChildren: BaseView[] = [];
	autoDirty = false;

	constructor() {
		super(new Rect());
		this.zoomState = new ZoomState({
			yBelowOrigin: false
		});
		this.initController();
	}

	push<T extends BaseView>(views: T[]) {
		this.children.push(...views);
	}

	pushA<T extends BaseView>(views: T[]) {
		this.absoluteChildren.push(...views);
	}

	pushAX<T extends BaseView>(views: T[]) {
		this.xAbsoluteChildren.push(...views);
	}

	pushAY<T extends BaseView>(views: T[]) {
		this.yAbsoluteChildren.push(...views);
	}

	_render() {
		const { skCanvas } = this.ctx;
		const { position } = this.zoomState;
		const { frame } = this.ctx;

		let saveCount;
		/* 先渲染中间的内容，因为其他三个部分都要覆盖在上面*/
		saveCount = skCanvas.save();
		this.transform.position.set(position.x, position.y);
		this.transform.updateLocalTransform();
		skCanvas.concat(this.transform.localTransform.toArray(false));
		const childrenScreen = frame.toOffset(position.x, position.y);
		// Logger.info('render', `actual render frame(${childrenScreen.display})`);
		this.children.forEach((child) => {
			if (child.inScreen(childrenScreen)) {
				child.render();
			}
		});
		skCanvas.restoreToCount(saveCount);

		saveCount = skCanvas.save();
		this.transform.position.set(position.x, 0);
		this.transform.updateLocalTransform();
		skCanvas.concat(this.transform.localTransform.toArray(false));
		const yAScreen = frame.toOffset(position.x, 0);
		this.yAbsoluteChildren.forEach((child) => {
			if (child.inScreen(yAScreen)) {
				child.render();
			}
		});
		skCanvas.restoreToCount(saveCount);

		saveCount = skCanvas.save();
		this.transform.position.set(0, position.y);
		this.transform.updateLocalTransform();
		skCanvas.concat(this.transform.localTransform.toArray(false));
		const xAScreen = frame.toOffset(0, position.y);
		this.xAbsoluteChildren.forEach((child) => {
			if (child.inScreen(xAScreen)) {
				child.render();
			}
		});
		skCanvas.restoreToCount(saveCount);

		this.absoluteChildren.forEach((child) => {
			if (child.inScreen(frame)) {
				child.render();
			}
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

	build(): ComponentCaches {
		throw new Error('Method not implemented.');
	}
}
