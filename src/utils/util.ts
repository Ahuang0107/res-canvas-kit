import { Point } from '../base/point';
import { Rect } from '../base/rect';

export function inStretchArea(frame: Rect, offset: Point, pt: Point, stretchWidth = 5): boolean[] {
	return [
		new Rect(frame.left, frame.top, stretchWidth, frame.height).containsPoint(
			pt.minus(new Point(offset.x, offset.y))
		),
		new Rect(frame.right - stretchWidth, frame.top, stretchWidth, frame.height).containsPoint(
			pt.minus(new Point(offset.x, offset.y))
		)
	];
}
