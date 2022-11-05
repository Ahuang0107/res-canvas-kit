import { Rect } from '../base/rect';
import { Point } from '../base/point';

/**
 * 根据边框，文字和字号，计算得到文字水平垂直居中时显示的文字和定位
 * @param frame
 * @param text
 * @param size
 */
export function textLoc(frame: Rect, text: string, size: number): { text: string; pos: Point } {
	const singleCharWidth = (size * 2) / 3;
	// todo 需要添加文字和边框时最小间距的参数
	const maxWidth = frame.width;
	const maxTextWidth = maxWidth / singleCharWidth;
	let realText = text;
	if (maxTextWidth < text.length) {
		realText = text.slice(0, maxTextWidth - 3) + '...';
	}
	const realTextWidth = realText.length * 8;
	const realTextHeight = size;
	const realX = frame.x + (frame.width - realTextWidth) / 2;
	const realY = frame.y + frame.height / 2 + realTextHeight / 2;

	return {
		text: realText,
		pos: new Point(realX, realY)
	};
}
