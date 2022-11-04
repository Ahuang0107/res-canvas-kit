import invariant from 'ts-invariant';

export class Point {
	constructor(public x: number = 0, public y: number = 0) {}

	/**
	 * Calculates the angle ABC (in radians)
	 * A first point
	 * C second point
	 * B center point
	 */
	static calcAngleABC(A: Point, B: Point, C: Point) {
		const AB = A.distanceTo(B);
		const BC = B.distanceTo(C);
		const AC = C.distanceTo(A);
		return Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB));
	}

	compare(point: Point): Point {
		return new Point(this.x - point.x, this.y - point.y);
	}

	distanceTo(other: Point) {
		return Math.hypot(this.x - other.x, this.y - other.y);
	}

	add(pt: Point) {
		return new Point(this.x + pt.x, this.y + pt.y);
	}

	minus(pt: Point) {
		return new Point(this.x - pt.x, this.y - pt.y);
	}

	multiply(d: number) {
		return new Point(this.x * d, this.y * d);
	}

	norm() {
		const d = Math.hypot(this.x, this.y);
		invariant(d !== 0, 'cant norm a vector whos len is zero');
		return new Point(this.x / d, this.y / d);
	}
}
