import { Point } from '../base/point';
import { EventSupport } from '../view/base/event-support';
import { BaseView } from '../view/base/base-view';

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
	const hoverViews = [];
	// todo 因为z轴允许是负数，所以这里的判断起码要将maxZ设置成一个足够小的数
	let maxZ = -999;
	for (let i = views.length - 1; i >= 0; i--) {
		const layer = views[i];
		if (layer.containsPoint(pt, es, offsetX, offsetY)) {
			maxZ = Math.max(maxZ, layer.z);
			hoverViews.push(layer);
		}
	}
	return hoverViews.find((v) => v.z == maxZ);
}
