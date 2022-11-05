import { describe, expect, it } from 'vitest';
import { textLoc } from './text-loc';
import { Rect } from '../base/rect';
import { Point } from '../base/point';

describe('Text Loc Test', () => {
	it('textLoc 文字长度超出，高度不超出', () => {
		const frame = new Rect(0, 0, 120, 32);
		const text = new Array(9).fill('a').join();
		const received = textLoc(frame, text, 12);
		expect(received.text).toEqual('a,a,a,a,a,a,...');
		expect(received.pos).toEqual(new Point(0, 22));
	});
	it('textLoc 文字长度不超出，高度不超出', () => {
		const frame = new Rect(0, 0, 120, 32);
		const text = 'abc';
		const received = textLoc(frame, text, 12);
		expect(received.text).toEqual(text);
		expect(received.pos).toEqual(new Point(48, 22));
	});
});
