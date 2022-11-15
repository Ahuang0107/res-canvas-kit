import { Canvas, Paint, Paragraph, SkottieAnimation } from '@skeditor/canvaskit-wasm';
import { Point } from '../../base/point';
import { Rect } from '../../base/rect';
import { CanvasKitUtil } from '../../utils';

export type ComponentCaches = {
	cache?: DrawCache[];
	hoverCache?: DrawCache[];
	focusCache?: DrawCache[];
};

export type DrawCache = RectCache | ParaCache | LineCache | AnimaCache;

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

export class AnimaCache extends Cache {
	animation: SkottieAnimation;
	firstFrame: number;

	constructor(frame: Rect, json: never) {
		super(frame);
		this.animation = CanvasKitUtil.CanvasKit.MakeAnimation(JSON.stringify(json));
		this.firstFrame = new Date().getTime();
	}

	draw(canvas: Canvas): void {
		const now = new Date().getTime();
		const seek = ((now - this.firstFrame) / (this.animation.duration() * 1000)) % 1;
		this.animation.seek(seek);
		this.animation.render(canvas, this.frame.toFloat32Array());
	}
}
