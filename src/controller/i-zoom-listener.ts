import { Point } from '../base/point';

export interface IZoomListener {
	// emit offset
	onOffset(delta: Point): void;
}
