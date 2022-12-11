import { BaseView, ViewType } from '../../view/base/base-view';
import { findViewTop, logMeasureTime } from '../../utils';
import { BasePage } from '../../view/page/base-page';
import { Point } from '../../base/point';
import { EventSupport } from '../../view/base/event-support';
import { LineView, newLineViewFromH, newLineViewFromV, renderLine } from './line-view';
import { CellView, newCellViewFrom, renderCell } from './cell-view';
import { rectCopyWithOffset } from '../../base/rect';
import { Rows } from './model';
import { COLOR } from '../../view/utils';
import { distance_days } from 'res-canvas-kit-datetime';

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
	bookingViewsTiles: BaseView[] = [];
	bookingHeadViews: BaseView[] = [];
	bookingKeyViews: BaseView[] = [];
	bookingKeyHeadViews: BaseView[] = [];

	constructor(private w: number, private h: number) {
		super();
	}

	static new(w: number, h: number): CellPage {
		return new CellPage(w, h);
	}

	flush(rows: Rows) {
		let yStart = 0;
		rows.forEach((row, staff) => {
			this.bookingKeyViews.push(
				newCellViewFrom(
					0,
					yStart,
					this.w,
					this.h,
					{
						text: staff,
						fillColor: COLOR.GOFUN,
						strokeColor: COLOR.AISUMICHA
					},
					{ hover: true }
				)
			);
			row.forEach((bookings, engage) => {
				bookings.forEach((booking) => {
					const startIndex = distance_days(BigInt(Date.parse('2022-07-01')), BigInt(booking.start));
					const endIndex = distance_days(BigInt(Date.parse('2022-07-01')), BigInt(booking.end));
					console.log(endIndex - startIndex);
					if (endIndex - startIndex > 0) {
						this.bookingViewsTiles.push(
							newCellViewFrom(
								Number(startIndex) * this.w,
								yStart,
								(Number(endIndex) - Number(startIndex)) * this.w,
								this.h,
								{
									text: engage,
									fillColor: COLOR.KUCHIBA,
									strokeColor: COLOR.AISUMICHA
								},
								{ hover: true, focus: true, move: true, stretch: true, delete: true }
							)
						);
					}
				});
			});
			yStart += this.h;
		});
	}

	flushBackground() {
		this.skeletonViews = [];
		const { width, height } = this.ctx.canvasEl$.value.getBoundingClientRect();
		let x = 0;
		while (x < width) {
			this.skeletonViews.push(newLineViewFromV(x, 0, height));
			x += this.w;
		}
		let y = 0;
		while (y < height) {
			this.skeletonViews.push(newLineViewFromH(0, y, width));
			y += this.h;
		}
	}

	render() {
		const { skCanvas } = this.ctx;
		const { position } = this.controller;
		const { frame } = this.ctx;

		// const childrenScreen = rectCopyWithOffset(frame, -position.x, -position.y);
		this.skeletonViews.forEach((child) => {
			// if (child.frame.intersect(childrenScreen)) {
			if (child.type === ViewType.Line) {
				renderLine(skCanvas, child as LineView);
			}
			// }
		});

		let saveCount;
		/* 先渲染中间的内容，因为其他三个部分都要覆盖在上面*/
		saveCount = skCanvas.save();
		this.transform.position.set(position.x, position.y);
		this.transform.updateLocalTransform();
		skCanvas.concat(this.transform.localTransform.toArray(false));
		logMeasureTime();
		let num = 0;
		this.bookingViewsTiles.forEach((v) => {
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
		return (
			findViewTop(this.bookingKeyHeadViews, pt, es, 0, 0) ??
			findViewTop(this.bookingKeyViews, pt, es, 0, undefined) ??
			findViewTop(this.bookingHeadViews, pt, es, undefined, 0) ??
			findViewTop(this.bookingViewsTiles, pt, es, undefined, undefined)
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
