import { ZoomController } from '../../controller/zoom-controller';
import { Transform } from '../../base/transform';
import { BaseView } from '../base/base-view';
import { CanvasView } from '../canvas-view';
import { info } from '../../utils';
import { Point } from '../../base/point';
import { EventSupport } from '../base/event-support';

let id = 0;

export abstract class BasePage {
	id: string;
	ctx: CanvasView;
	controller: ZoomController;
	transform = new Transform();

	views: BaseView[] = [];

	protected constructor() {
		this.ctx = CanvasView.currentContext;
		this.controller = new ZoomController(this.ctx);
		this.id = id.toString();
		id++;
	}

	/**
	 * 添加视图
	 * @param views
	 */
	addViews<T extends BaseView>(views: T[]) {
		this.views.push(...views);
	}

	delete<T extends BaseView>(view: T) {
		const deleteIndex = this.views.findIndex((v) => v.id === view.id);
		if (deleteIndex > -1) {
			this.views.splice(deleteIndex, 1);
			this.ctx.markDirty();
		}
	}

	prebuild(all = false) {
		const start = Date.now();
		const { frame } = this.ctx;
		const { position } = this.controller;
		const childrenScreen = frame.toOffset(-position.x, -position.y);
		let viewInScreenNum = 0;
		this.views.forEach((view) => {
			if (all || view.inScreen(childrenScreen)) {
				view.prebuild();
				viewInScreenNum++;
			}
		});
		info('page prebuild', `(${viewInScreenNum})costs: ${Date.now() - start}`);
	}

	render() {
		const start = Date.now();
		const { skCanvas } = this.ctx;
		const { position } = this.controller;
		const { frame } = this.ctx;

		skCanvas.save();
		this.transform.position.set(position.x, position.y);
		this.transform.updateLocalTransform();
		skCanvas.concat(this.transform.localTransform.toArray(false));
		const childrenScreen = frame.toOffset(-position.x, -position.y);
		const viewMap = new Map<number, BaseView[]>();
		this.views.forEach((child) => {
			if (child.inScreen(childrenScreen)) {
				viewMap.set(child.z, [...(viewMap.get(child.z) ?? []), child]);
			}
		});
		viewMap.forEach((v) => {
			v.forEach((child) => {
				child.render();
			});
		});
		info('page render', `costs: ${Date.now() - start}`);
	}

	abstract findViewTop(pt: Point, es: EventSupport): BaseView | undefined;

	clearViews() {
		this.views = []
	}
}
