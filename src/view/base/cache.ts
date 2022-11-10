import { Canvas, Paint, Paragraph } from '@skeditor/canvaskit-wasm';
import { Point } from '../../base/point';
import { Rect } from '../../base/rect';

export type ComponentCaches = {
	cache?: DrawCache[];
	hoverCache?: DrawCache[];
	focusCache?: DrawCache[];
};

export type DrawCache = RectCache | ParaCache | LineCache;

abstract class Cache {
	protected constructor(public frame: Rect) {}

	abstract draw(canvas: Canvas): void;
}

export class RectCache extends Cache {
	constructor(rect: Rect, public paint: Paint) {
		super(rect);
	}

	draw(canvas: Canvas) {
		canvas.drawRect(this.frame.toFloat32Array(), this.paint);
	}
}

export class ParaCache extends Cache {
	constructor(rect: Rect, public para: Paragraph, public pos: Point) {
		super(rect);
	}

	draw(canvas: Canvas) {
		const pos = this.frame.leftTop.add(this.pos);
		this.para.layout(this.frame.width);
		canvas.drawParagraph(this.para, pos.x, pos.y);
	}
}

export class LineCache extends Cache {
	constructor(frame: Rect, public paint: Paint) {
		super(frame);
	}

	draw(canvas: Canvas) {
		canvas.drawLine(
			this.frame.left,
			this.frame.top,
			this.frame.right,
			this.frame.bottom,
			this.paint
		);
	}
}
