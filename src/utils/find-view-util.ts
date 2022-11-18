import { Point } from '../base/point';
import { EventSupport } from '../view/base/event-support';
import { BaseView, containsPoint } from '../view/base/base-view';

/**
 * 搜索Top的View
 * - 按照z轴从高到低的顺序查找
 * - 筛选是否支持hover的元素，是否支持focus的元素，是否支持move的元素，是否支持stretch的元素
 * todo 这里es不应该是根据es排除然后找view，而是找到view后根据es判断是否符合，不符合则返回undefined
 * @param views
 * @param pt
 * @param es
 * @param offsetX
 * @param offsetY
 */
export function findViewTop(
	views: BaseView[],
	pt: Point,
	es: EventSupport,
	offsetX?: number,
	offsetY?: number
): BaseView | undefined {
	for (let i = views.length - 1; i >= 0; i--) {
		const layer = views[i];
		if (containsPoint(layer, pt, es, offsetX, offsetY)) {
			return layer;
		}
	}
}
