import { Point } from './point';

export class Rect {
	constructor(
		public x: number = 0,
		public y: number = 0,
		public w: number = 0,
		public h: number = 0
	) {}

	get left() {
		return this.x;
	}

	get right() {
		return this.x + this.w;
	}

	get top() {
		return this.y;
	}

	get bottom() {
		return this.y + this.h;
	}

	get leftTop() {
		return new Point(this.x, this.y);
	}

	containsPoint(pt: Point): boolean {
		return this.x <= pt.x && pt.x <= this.right && this.y <= pt.y && pt.y <= this.bottom;
	}

	intersect(another: Rect): boolean {
		return !(
			another.left > this.right ||
			another.right < this.left ||
			another.top > this.bottom ||
			another.bottom < this.top
		);
	}

	toFloat32Array(): Float32Array {
		return new Float32Array([this.x, this.y, this.x + this.w, this.y + this.h]);
	}
}

export function rectCopyWithOffset(rect: Rect, x: number, y: number) {
	const result = new Rect(rect.x, rect.y, rect.w, rect.h);
	return rectOffset(result, x, y);
}

export function rectOffset(rect: Rect, x: number, y: number): Rect {
	rect.x = rect.x + x;
	rect.y = rect.y + y;
	return rect;
}
