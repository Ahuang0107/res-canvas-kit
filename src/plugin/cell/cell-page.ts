import { BaseView, ViewType } from '../../view/base/base-view';
import { findViewTop, logMeasureTime } from '../../utils';
import { BasePage } from '../../view/page/base-page';
import { Point } from '../../base/point';
import { EventSupport } from '../../view/base/event-support';
import { BookingsModel, CellsModel, ColumnModel } from './model';
import { LineView, newLineViewFromH, newLineViewFromV, renderLine } from './line-view';
import invariant from 'ts-invariant';
import { CellView, newCellViewFrom, renderCell } from './cell-view';
import { rectCopyWithOffset } from '../../base/rect';
import { COLOR } from '../../view/utils';

/**
 * 虽然名称叫CellPage，但是目前改造成专门为渲染Reservation类型数据的TablePage
 * 最底层渲染表格的横线竖线 - skeletonViews
 * 上面一层渲染booking数据 - bookingViews
 * 再上面一层渲染booking的表头数据（y轴不会移动） - bookingHeadViews
 * 再上面一层渲染左侧关联数据（x轴不会移动） - bookingKeyViews
 * 最上层渲染左上角的关联数据的表头（x轴和y轴都不会移动） - bookingKeyHeadViews
 */
export class CellPage extends BasePage {
	// todo 目前先不用，性能的瓶颈更多的是在booking数据太大遍历cost太大，需要分tile
	//  主要的问题是booking的跨度可以很大，所以横向不知道如何划分
	//  竖向因为行高是固定的，所以可以进行tile划分
	skeletonViews: BaseView[] = [];
	// 二级分页
	bookingViewsTiles: Map<number, Map<number, BaseView[]>> = new Map();
	bookingHeadViews: BaseView[] = [];
	bookingKeyViews: BaseView[] = [];
	bookingKeyHeadViews: BaseView[] = [];

	rowHeight = 0;
	cellWidth = 0;

	yFirstPageSize = 50;

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
		this.rowHeight = this.cellsModel.height;
		this.cellWidth = this.cellsModel.width;
		const rowHeight = this.rowHeight;
		const rowsNum = this.columnModel.rows.length;
		const headsRowsNum = this.cellsModel.multiHeads.length;
		const cellWidth = this.cellWidth;

		this.clearViews();
		this.controller.option.yMin = 0;
		this.controller.option.yMax = (rowsNum - headsRowsNum) * rowHeight;

		logMeasureTime();
		this.cellsModel.multiHeads.forEach((heads, index) => {
			heads.forEach((head) => {
				this.bookingHeadViews.push(
					newCellViewFrom(
						head.index * cellWidth,
						index * rowHeight,
						head.width ?? cellWidth,
						rowHeight,
						{
							text: head.text,
							fillColor: COLOR.SHIRONEZUMI,
							strokeColor: COLOR.AISUMICHA
						},
						{ hover: true }
					)
				);
			});
		});
		logMeasureTime('Prepare Date', 'date head');

		this.cellsModel.multiHeads[this.cellsModel.columnLineFollowHeadIndex]?.forEach((head) => {
			this.skeletonViews.push(
				newLineViewFromV(head.index * cellWidth, 0, (rowsNum + headsRowsNum) * rowHeight)
			);
		});

		const calHeads = this.cellsModel.multiHeads[this.cellsModel.columnLineFollowHeadIndex];
		if (calHeads) {
			const minX = (calHeads[0]?.index ?? 0) * cellWidth;
			const maxX = ((calHeads[calHeads.length - 1]?.index ?? 0) + 1) * cellWidth;
			for (let rowIndex = 0; rowIndex < rowsNum; rowIndex += 1) {
				this.skeletonViews.push(
					newLineViewFromH(
						minX,
						(this.cellsModel.multiHeads.length + rowIndex) * rowHeight,
						maxX - minX
					)
				);
			}
		}

		logMeasureTime();
		for (let i = 0; i < rowsNum; i += this.yFirstPageSize) {
			this.bookingViewsTiles.set(Math.floor(i / this.yFirstPageSize), new Map());
		}
		this.bookingsModel.bookings.forEach((bookings, index) => {
			const y = (this.cellsModel.multiHeads.length + index) * rowHeight;
			const viewsTile = this.bookingViewsTiles.get(Math.floor(index / this.yFirstPageSize));
			invariant(viewsTile, 'fail to get views tile');
			const bookingViews = bookings.map((booking) => {
				return newCellViewFrom(
					booking.i * cellWidth + (booking.o ?? 0),
					y,
					booking.w ?? cellWidth,
					rowHeight,
					{
						text: booking.t,
						fillColor: booking.c,
						strokeColor: COLOR.AISUMICHA,
						hoverColor: booking.h
					},
					{ hover: true, focus: true, move: true, stretch: true, delete: true }
				);
			});
			viewsTile.set(viewsTile.size, bookingViews);
		});
		logMeasureTime('Prepare Date', 'booking');

		logMeasureTime();
		this.columnModel.multiHeads.forEach((heads, index) => {
			let xStart = 0;
			heads.forEach((head) => {
				this.bookingKeyHeadViews.push(
					newCellViewFrom(
						xStart,
						index * rowHeight,
						head.width,
						rowHeight,
						{
							text: head.text,
							fillColor: COLOR.SHIRONEZUMI,
							strokeColor: COLOR.AISUMICHA
						},
						{ hover: true }
					)
				);
				xStart += head.width;
			});
		});
		this.columnModel.rows.forEach((row, index) => {
			let xStart = 0;
			row.forEach((data) => {
				this.bookingKeyViews.push(
					newCellViewFrom(
						xStart,
						(this.columnModel.multiHeads.length + index) * rowHeight,
						data.width,
						rowHeight,
						{
							text: data.text,
							fillColor: COLOR.GOFUN,
							strokeColor: COLOR.AISUMICHA
						},
						{ hover: true }
					)
				);
				xStart += data.width;
			});
		});
		logMeasureTime('Prepare Date', 'staff');
	}

	render() {
		const { skCanvas } = this.ctx;
		const { position } = this.controller;
		const { frame } = this.ctx;

		let saveCount;
		/* 先渲染中间的内容，因为其他三个部分都要覆盖在上面*/
		saveCount = skCanvas.save();
		this.transform.position.set(position.x, position.y);
		this.transform.updateLocalTransform();
		skCanvas.concat(this.transform.localTransform.toArray(false));
		const childrenScreen = rectCopyWithOffset(frame, -position.x, -position.y);
		this.skeletonViews.forEach((child) => {
			if (child.frame.intersect(childrenScreen)) {
				if (child.type === ViewType.Line) {
					renderLine(skCanvas, child as LineView);
				}
			}
		});
		const yTop = childrenScreen.top;
		const yBottom = childrenScreen.bottom;
		const needRenderViews: BaseView[] = [];
		logMeasureTime();
		Array.from(this.bookingViewsTiles.keys()).forEach((index) => {
			const actualY = index * this.yFirstPageSize * 24;
			if (
				actualY + this.yFirstPageSize * 24 >= yTop &&
				actualY - this.yFirstPageSize * 24 <= yBottom
			) {
				const viewsTile = this.bookingViewsTiles.get(index);
				invariant(viewsTile, 'fail to get viewsTile');
				// todo 因为有二级分页，所以边界还可以更加详细判断是否渲染
				// if (actualY >= yTop && actualY <= yBottom) {
				viewsTile.forEach((vs) => {
					vs.forEach((v) => {
						if (v.frame.intersect(childrenScreen)) {
							needRenderViews.push(v);
						}
					});
				});
				// }
			}
		});
		logMeasureTime('Traverse', 'find need render views');
		logMeasureTime();
		let num = 0;
		needRenderViews.forEach((v) => {
			if (v.type === ViewType.Cell) {
				renderCell(skCanvas, v as CellView);
				num++;
			}
		});
		logMeasureTime(`Render Cell(${num})`);

		this.ctx.pageState.hoverCell.forEach((v) => {
			renderCell(skCanvas, v as CellView);
		});

		skCanvas.restoreToCount(saveCount);

		saveCount = skCanvas.save();
		this.transform.position.set(position.x, 0);
		this.transform.updateLocalTransform();
		skCanvas.concat(this.transform.localTransform.toArray(false));
		const yAScreen = rectCopyWithOffset(frame, -position.x, 0);
		this.bookingHeadViews.forEach((child) => {
			if (child.frame.intersect(yAScreen)) {
				if (child.type === ViewType.Cell) {
					renderCell(skCanvas, child as CellView);
				}
			}
		});
		skCanvas.restoreToCount(saveCount);

		saveCount = skCanvas.save();
		this.transform.position.set(0, position.y);
		this.transform.updateLocalTransform();
		skCanvas.concat(this.transform.localTransform.toArray(false));
		const xAScreen = rectCopyWithOffset(frame, 0, -position.y);
		this.bookingKeyViews.forEach((child) => {
			if (child.frame.intersect(xAScreen)) {
				if (child.type === ViewType.Cell) {
					renderCell(skCanvas, child as CellView);
				}
			}
		});
		skCanvas.restoreToCount(saveCount);

		this.bookingKeyHeadViews.forEach((child) => {
			if (child.frame.intersect(frame)) {
				if (child.type === ViewType.Cell) {
					renderCell(skCanvas, child as CellView);
				}
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
		const offset = this.transform.position;
		const headHeight = this.cellsModel.height * this.cellsModel.multiHeads.length;
		const actualY = pt.y - offset.y;
		const actualBookingY = actualY - headHeight;
		const tileIndex = Math.floor(actualBookingY / this.cellsModel.height / this.yFirstPageSize);
		const tile = this.bookingViewsTiles.get(tileIndex);
		if (!tile) return;
		const tileOffset = Math.floor((actualBookingY / this.cellsModel.height) % this.yFirstPageSize);
		const currentTileBookings = tile.get(tileOffset);
		if (!currentTileBookings) return;
		return (
			findViewTop(this.bookingKeyHeadViews, pt, es, 0, 0) ??
			findViewTop(this.bookingKeyViews, pt, es, 0, undefined) ??
			findViewTop(this.bookingHeadViews, pt, es, undefined, 0) ??
			findViewTop(currentTileBookings, pt, es, undefined, undefined)
		);
	}

	clearViews() {
		this.bookingKeyHeadViews = [];
		this.bookingKeyViews = [];
		this.bookingHeadViews = [];
	}

	delete(view: BaseView): void {
		console.log('delete ' + view);
	}
}
