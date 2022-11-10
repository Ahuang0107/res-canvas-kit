import { describe, expect, it } from 'vitest';
import { Rect } from './rect';

describe('intersect tests', () => {
	it('frame in screen test', () => {
		const frame = new Rect(50, 50, 50, 50);
		const screen = new Rect(0, 0, 1920, 1080);
		expect(screen.intersect(frame)).true;
	});
	it('frame in screen border test', () => {
		const frame = new Rect(-25, -25, 50, 50);
		const screen = new Rect(0, 0, 1920, 1080);
		expect(screen.intersect(frame)).true;
	});
	it('frame out screen test', () => {
		const frame = new Rect(-100, -100, 50, 50);
		const screen = new Rect(0, 0, 1920, 1080);
		expect(screen.intersect(frame)).false;
	});
	it('frame cover screen test', () => {
		const frame = new Rect(-100, -100, 3000, 2000);
		const screen = new Rect(0, 0, 1920, 1080);
		expect(screen.intersect(frame)).true;
	});
});
