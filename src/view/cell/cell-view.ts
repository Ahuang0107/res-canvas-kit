import { BaseView } from '../base/base-view';
import { ComponentCaches } from '../base/cache';
import { buildCell, CellConfig } from './cell-util';
import { Rect } from '../../base/rect';
import { EventSupport } from '../base/event-support';
import { Point } from '../../base/point';
import { inStretchArea } from '../../utils/util';

export class CellView extends BaseView {
	protected constructor(
		frame: Rect,
		private config: CellConfig,
		eventSupport: EventSupport,
		/**
		 * CellView 主要用来渲染表格数据，经常会与数据模型有一对一的关系，因此数据更新时可以使用此model来关联更新视图
		 */
		private model?: never,
		z?: number
	) {
		super(frame, z);
		const {
			supportHover = false,
			supportFocus = false,
			supportMove = false,
			supportStretch = false
		} = eventSupport;
		this.eventSupport.supportHover = supportHover;
		this.eventSupport.supportFocus = supportFocus;
		this.eventSupport.supportMove = supportMove;
		this.eventSupport.supportStretch = supportStretch;
	}

	/**
	 * 创建一个Cell视图
	 * @param x 整个world的x坐标
	 * @param y 整个world的y坐标
	 * @param w cell的长度
	 * @param h cell的宽度
	 * @param cf 需要填充的文字和样式等配置
	 * @param es 对交互事件的支持
	 * @param model 视图对应的数据模型
	 * @param z z轴，越小越底层
	 */
	static from(
		x: number,
		y: number,
		w: number,
		h: number,
		cf: CellConfig,
		es: EventSupport,
		model?: never,
		z?: number
	): CellView {
		return new CellView(new Rect(x, y, w, h), cf, es, model, z);
	}

	build(): ComponentCaches {
		return buildCell(this.frame, this.config);
	}

	inStretchArea(pt: Point, stretchWidth = 5): boolean[] {
		if (!this.ctx.currentPage) return [false, false];
		const offset = this.ctx.currentPage.transform.position;
		return inStretchArea(this.frame, new Point(offset.x, offset.y), pt, stretchWidth);
	}

	stretchLeft(offset: number) {
		if (offset > 0) {
			this.frame.x = this.frame.x - offset;
			this.frame.width = this.frame.width + offset;
		} else {
			if (!(this.frame.width + offset < 20)) {
				this.frame.x = this.frame.x - offset;
				this.frame.width = this.frame.width + offset;
			}
		}
	}

	stretchRight(offset: number) {
		if (offset > 0) {
			this.frame.width = this.frame.width + offset;
		} else {
			if (!(this.frame.width + offset < 20)) {
				this.frame.width = this.frame.width + offset;
			}
		}
	}
}
