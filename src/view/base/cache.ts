import { Canvas, Font, InputRect, Paint, Paragraph } from '@skeditor/canvaskit-wasm';
import { Point } from '../../base/point';

export type ComponentCaches = {
	cache: DrawCache[];
	hoverCache?: DrawCache[];
	focusCache?: DrawCache[];
};

export type DrawCache = RectCache | TextCache | ParaCache | LineCache;

abstract class Cache {
	abstract draw(canvas: Canvas): void;
}

export class RectCache extends Cache {
	constructor(public rect: InputRect, public paint: Paint) {
		super();
	}

	draw(canvas: Canvas) {
		canvas.drawRRect(this.rect, this.paint);
	}
}

export class TextCache extends Cache {
	constructor(public str: string, public pos: Point, public paint: Paint, public font: Font) {
		super();
	}

	draw(canvas: Canvas) {
		canvas.drawText(this.str, this.pos.x, this.pos.y, this.paint, this.font);
	}
}

export class ParaCache extends Cache {
	constructor(public para: Paragraph, public pos: Point) {
		super();
	}

	draw(canvas: Canvas) {
		canvas.drawParagraph(this.para, this.pos.x, this.pos.y);
	}
}

export class LineCache extends Cache {
	constructor(public start: Point, public end: Point, public paint: Paint) {
		super();
	}

	draw(canvas: Canvas) {
		canvas.drawLine(this.start.x, this.start.y, this.end.x, this.end.y, this.paint);
	}
}
