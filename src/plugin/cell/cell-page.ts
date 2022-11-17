import { BaseView } from '../../view/base/base-view';
import { CanvasKitUtil, findViewTop, info, logMT } from '../../utils';
import { BasePage } from '../../view/page/base-page';
import { Point } from '../../base/point';
import { EventSupport } from '../../view/base/event-support';
import { CellView } from './cell-view';
import { BookingsModel, CellsModel, ColumnModel } from './model';

export class CellPage extends BasePage {
	fixedViews: BaseView[] = [];
	xFixedViews: BaseView[] = [];
	yFixedViews: BaseView[] = [];

	protected constructor(
		private columnModel: ColumnModel,
		private bookingsModel: BookingsModel,
		private cellsModel: CellsModel
	) {
		super();
	}

	static new(
		columnMode: ColumnModel,
		bookingsModel: BookingsModel,
		cellsModel: CellsModel
	): CellPage {
		return new CellPage(columnMode, bookingsModel, cellsModel);
	}

	updateFromModel() {
		const headFillColor = CanvasKitUtil.CanvasKit.Color(217, 217, 217);
		const headStrokeColor = CanvasKitUtil.CanvasKit.Color(68, 67, 89);
		const cellFillColor = CanvasKitUtil.CanvasKit.WHITE;
		const cellHoverColor = CanvasKitUtil.CanvasKit.Color(240, 240, 240);
		const cellFocusColor = CanvasKitUtil.CanvasKit.Color(217, 217, 217);
		const cellStrokeColor = CanvasKitUtil.CanvasKit.Color(128, 128, 128);
		const bookingFillColor = CanvasKitUtil.CanvasKit.Color(129, 199, 212);

		const rowHeight = this.cellsModel.height;
		const rowsNum = this.columnModel.rows.length;
		const headsRowsNum = this.cellsModel.multiHeads.length;
		const cellWidth = this.cellsModel.width;

		this.clearViews();
		this.controller.option.yMin = 0;
		this.controller.option.yMax = (rowsNum - headsRowsNum + 1) * rowHeight;

		this.cellsModel.multiHeads.forEach((heads, index) => {
			heads.forEach((head) => {
				this.addYFixedViews([
					CellView.from(
						head.index * cellWidth,
						index * rowHeight,
						head.width ?? cellWidth,
						rowHeight,
						{
							text: head.text,
							style: {
								fillColor: headFillColor,
								strokeColor: headStrokeColor
							},
							hoverStyle: {
								fillColor: cellHoverColor,
								strokeColor: headStrokeColor
							}
						},
						{ hover: true }
					)
				]);
			});
		});

		this.cellsModel.multiHeads[this.cellsModel.columnLineFollowHeadIndex]?.forEach((head) => {
			for (let rowIndex = 0; rowIndex < rowsNum; rowIndex += 1) {
				const y = (this.cellsModel.multiHeads.length + rowIndex) * rowHeight;
				this.addViews([
					CellView.from(
						head.index * cellWidth,
						y,
						32,
						rowHeight,
						{
							style: {
								fillColor: cellFillColor,
								strokeColor: cellStrokeColor
							},
							hoverStyle: {
								fillColor: cellHoverColor,
								strokeColor: cellStrokeColor
							},
							focusStyle: {
								fillColor: cellFocusColor,
								strokeColor: cellStrokeColor
							}
						},
						{ hover: true, focus: true },
						undefined,
						1
					)
				]);
			}
		});

		this.bookingsModel.bookings.forEach((bookings, index) => {
			bookings.forEach((booking) => {
				this.addViews([
					CellView.from(
						booking.index * cellWidth + (booking.offset ?? 0),
						(this.cellsModel.multiHeads.length + index) * rowHeight,
						booking.width ?? cellWidth,
						rowHeight,
						{
							text: booking.text,
							textSize: 10,
							style: {
								fillColor: bookingFillColor,
								strokeColor: headStrokeColor
							},
							hoverStyle: {
								fillColor: cellHoverColor,
								strokeColor: headStrokeColor
							},
							focusStyle: {
								fillColor: cellFocusColor,
								strokeColor: headStrokeColor
							}
						},
						{ hover: true, focus: true, move: true, stretch: true, delete: true },
						undefined,
						10
					)
				]);
			});
		});

		this.columnModel.multiHeads.forEach((heads, index) => {
			let xStart = 0;
			heads.forEach((head) => {
				this.addFixedViews([
					CellView.from(
						xStart,
						index * rowHeight,
						head.width,
						rowHeight,
						{
							text: head.text,
							style: {
								fillColor: headFillColor,
								strokeColor: headStrokeColor
							},
							hoverStyle: {
								fillColor: cellHoverColor,
								strokeColor: headStrokeColor
							}
						},
						{ hover: true }
					)
				]);
				xStart += head.width;
			});
		});
		this.columnModel.rows.forEach((row, index) => {
			let xStart = 0;
			row.forEach((data) => {
				this.addXFixedViews([
					CellView.from(
						xStart,
						(this.columnModel.multiHeads.length + index) * rowHeight,
						data.width,
						rowHeight,
						{
							text: data.text,
							style: {
								fillColor: cellHoverColor,
								strokeColor: headStrokeColor
							},
							hoverStyle: {
								fillColor: cellFocusColor,
								strokeColor: headStrokeColor
							}
						},
						{ hover: true }
					)
				]);
				xStart += data.width;
			});
		});
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
		this.fixedViews.forEach((view) => {
			if (all || view.inScreen(childrenScreen)) {
				view.prebuild();
				viewInScreenNum++;
			}
		});
		this.xFixedViews.forEach((view) => {
			if (all || view.inScreen(childrenScreen)) {
				view.prebuild();
				viewInScreenNum++;
			}
		});
		this.yFixedViews.forEach((view) => {
			if (all || view.inScreen(childrenScreen)) {
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

	clearViews() {
		super.clearViews();
		this.fixedViews = [];
		this.xFixedViews = [];
		this.yFixedViews = [];
	}
}
