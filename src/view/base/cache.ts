import { Canvas, Paint, Paragraph } from '@skeditor/canvaskit-wasm';
import { Point } from '../../base/point';
import { Rect } from '../../base/rect';

export type ComponentCaches = {
	cache: DrawCache[];
	hoverCache?: DrawCache[];
	focusCache?: DrawCache[];
};

export type DrawCache = RectCache | ParaCache;

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
		canvas.drawParagraph(this.para, pos.x, pos.y);
	}
}
