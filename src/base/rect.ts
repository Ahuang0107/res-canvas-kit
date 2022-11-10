import { Point } from './point';

export class Rect {
	constructor(
		public x: number = 0,
		public y: number = 0,
		public width: number = 0,
		public height: number = 0
	) {}

	get left() {
		return this.x;
	}

	get right() {
		return this.x + this.width;
	}

	get top() {
		return this.y;
	}

	get bottom() {
		return this.y + this.height;
	}

	get center(): Point {
		return new Point(this.x + this.width / 2, this.y + this.height / 2);
	}

	get leftTop() {
		return new Point(this.x, this.y);
	}

	get rightTop() {
		return new Point(this.x + this.width, this.y);
	}

	get leftBottom() {
		return new Point(this.x, this.y + this.height);
	}

	get rightBottom() {
		return new Point(this.x + this.width, this.y + this.height);
	}

	get display() {
		return `position: (${this.x},${this.y}), size: (${this.width},${this.height})`;
	}

	containsPoint(pt: Point): boolean {
		return this.x <= pt.x && pt.x <= this.right && this.y <= pt.y && pt.y <= this.bottom;
	}

	intersect(another: Rect): boolean {
		const startX1 = this.x,
			startY1 = this.y,
			endX1 = startX1 + this.width,
			endY1 = startY1 + this.height;

		const startX2 = another.x,
			startY2 = another.y,
			endX2 = startX2 + another.width,
			endY2 = startY2 + another.height;

		return !(endY2 < startY1 || endY1 < startY2 || startX1 > endX2 || startX2 > endX1);
	}

	toFloat32Array(): Float32Array {
		return new Float32Array([this.x, this.y, this.x + this.width, this.y + this.height]);
	}

	copy(): Rect {
		return new Rect(this.x, this.y, this.width, this.height);
	}

	offset(x: number, y: number): Rect {
		this.x = this.x + x;
		this.y = this.y + y;
		return this;
	}

	toOffset(x: number, y: number) {
		return this.copy().offset(x, y);
	}
}
