import { describe, expect, it } from 'vitest';
import { inStretchArea } from './util';
import { Rect } from '../base/rect';
import { Point } from '../base/point';

describe('inStretchArea tests', () => {
	const frame = new Rect(0, 0, 30, 10);
	const offset = new Point();
	it('in left stretch area border', () => {
		const pt = new Point(0, 0);
		const result = inStretchArea(frame, offset, pt);
		expect(result).toStrictEqual([true, false]);
	});
	it('in left stretch area border', () => {
		const pt = new Point(5, 0);
		const result = inStretchArea(frame, offset, pt);
		expect(result).toStrictEqual([true, false]);
	});
	it('in left stretch area', () => {
		const pt = new Point(2.5, 5);
		const result = inStretchArea(frame, offset, pt);
		expect(result).toStrictEqual([true, false]);
	});
	it('left to left stretch area', () => {
		const pt = new Point(-5, 5);
		const result = inStretchArea(frame, offset, pt);
		expect(result).toStrictEqual([false, false]);
	});
	it('right to left stretch area', () => {
		const pt = new Point(10, 5);
		const result = inStretchArea(frame, offset, pt);
		expect(result).toStrictEqual([false, false]);
	});
	it('in right stretch area border', () => {
		const pt = new Point(30, 0);
		const result = inStretchArea(frame, offset, pt);
		expect(result).toStrictEqual([false, true]);
	});
	it('in right stretch area border', () => {
		const pt = new Point(25, 0);
		const result = inStretchArea(frame, offset, pt);
		expect(result).toStrictEqual([false, true]);
	});
	it('in right stretch area', () => {
		const pt = new Point(27.5, 5);
		const result = inStretchArea(frame, offset, pt);
		expect(result).toStrictEqual([false, true]);
	});
	it('left to right stretch area', () => {
		const pt = new Point(20, 5);
		const result = inStretchArea(frame, offset, pt);
		expect(result).toStrictEqual([false, false]);
	});
	it('right to right stretch area', () => {
		const pt = new Point(35, 5);
		const result = inStretchArea(frame, offset, pt);
		expect(result).toStrictEqual([false, false]);
	});
});
