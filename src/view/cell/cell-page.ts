import { BaseView } from '../base/base-view';
import { findViewTop, info, logMT } from '../../utils';
import { BasePage } from '../page/base-page';
import { Point } from '../../base/point';
import { EventSupport } from '../base/event-support';

export class CellPage extends BasePage {
	fixedViews: BaseView[] = [];
	xFixedViews: BaseView[] = [];
	yFixedViews: BaseView[] = [];

	protected constructor() {
		super();
	}

	static default(): CellPage {
		return new CellPage();
	}

	/**
	 * 添加x轴和y轴fixed的视图，相对画布显示区域的定位的是不变的
	 * @param views
	 */
	addFixedViews<T extends BaseView>(views: T[]) {
		this.fixedViews.push(...views);
	}

	/**
	 * 添加x轴fixed的视图，相对画布显示区域的x轴定位是不变的，适合用来绘制固定列
	 * @param views
	 */
	addXFixedViews<T extends BaseView>(views: T[]) {
		this.xFixedViews.push(...views);
	}

	/**
	 * 添加y轴fixed的视图，相对画布显示区域的y轴定位是不变的，适合用来绘制表头
	 * @param views
	 */
	addYFixedViews<T extends BaseView>(views: T[]) {
		this.yFixedViews.push(...views);
	}

	prebuild() {
		const start = Date.now();
		const { frame } = this.ctx;
		const { position } = this.controller;
		const childrenScreen = frame.toOffset(-position.x, -position.y);
		let viewInScreenNum = 0;
		this.views.forEach((view) => {
			if (view.inScreen(childrenScreen)) {
				view.prebuild();
				viewInScreenNum++;
			}
		});
		this.fixedViews.forEach((view) => {
			if (view.inScreen(childrenScreen)) {
				view.prebuild();
				viewInScreenNum++;
			}
		});
		this.xFixedViews.forEach((view) => {
			if (view.inScreen(childrenScreen)) {
				view.prebuild();
				viewInScreenNum++;
			}
		});
		this.yFixedViews.forEach((view) => {
			if (view.inScreen(childrenScreen)) {
				view.prebuild();
				viewInScreenNum++;
			}
		});
		info('page prebuild', `(${viewInScreenNum})costs: ${Date.now() - start}`);
	}

	render() {
		const { skCanvas } = this.ctx;
		const { position } = this.controller;
		const { frame } = this.ctx;

		let saveCount;
		/* 先渲染中间的内容，因为其他三个部分都要覆盖在上面*/
		saveCount = skCanvas.save();
		logMT('page transform', () => {
			this.transform.position.set(position.x, position.y);
			this.transform.updateLocalTransform();
			skCanvas.concat(this.transform.localTransform.toArray(false));
		});
		const childrenScreen = frame.toOffset(-position.x, -position.y);
		const viewMap = new Map<number, BaseView[]>();
		logMT('page sort', () => {
			let num = 0;
			this.views.forEach((child) => {
				if (child.inScreen(childrenScreen)) {
					viewMap.get(child.z)?.push(child) ?? viewMap.set(child.z, [child]);
					num++;
				}
			});
			return num;
		});
		logMT('page render', () => {
			const keys = Array.from(viewMap.keys()).sort();
			keys.forEach((z) => {
				viewMap.get(z)?.forEach((v) => {
					v.render();
				});
			});
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
	}

	/**
	 * 按照fixed view->x fixed view->y fixed view->view的顺序来查找
	 * @param pt
	 * @param es
	 */
	findViewTop(pt: Point, es: EventSupport): BaseView | undefined {
		return (
			findViewTop(this.fixedViews, pt, es, 0, 0) ??
			findViewTop(this.xFixedViews, pt, es, 0, undefined) ??
			findViewTop(this.yFixedViews, pt, es, undefined, 0) ??
			findViewTop(this.views, pt, es, undefined, undefined)
		);
	}
}
