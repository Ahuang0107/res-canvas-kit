import { BaseView } from '../base/base-view';
import { ComponentCaches } from '../base/cache';
import { buildCell, CellConfig } from './cell-util';
import { Rect } from '../../base/rect';

export class CellView extends BaseView {
	/**
	 * CellView 主要用来渲染表格数据，经常会与数据模型有一对一的关系，因此数据更新时可以使用此model来关联更新视图
	 */
	model: never | undefined = undefined;

	constructor(frame: Rect, private config: CellConfig, z?: number) {
		super(frame, z);
	}

	build(): ComponentCaches {
		return buildCell(this.frame, this.config);
	}
}
