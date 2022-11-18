import { ZoomController } from '../../controller/zoom-controller';
import { Transform } from '../../base/transform';
import { BaseView } from '../base/base-view';
import { CanvasView } from '../canvas-view';
import { Point } from '../../base/point';
import { EventSupport } from '../base/event-support';

let id = 0;

export abstract class BasePage {
	id: string;
	ctx: CanvasView;
	controller: ZoomController;
	transform = new Transform();

	protected constructor() {
		this.ctx = CanvasView.currentContext;
		this.controller = new ZoomController(this.ctx);
		this.id = id.toString();
		id++;
	}

	abstract render(): void;

	abstract findViewTop(pt: Point, es: EventSupport): BaseView | undefined;

	abstract delete(view: BaseView): void;
}
