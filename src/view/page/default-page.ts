import { BasePage } from './base-page';
import { BaseView } from '../base/base-view';
import { EventSupport } from '../base/event-support';
import { Point } from '../../base/point';
import { findViewTop } from '../../utils';

export class DefaultPage extends BasePage {
	static default(): DefaultPage {
		return new DefaultPage();
	}

	findViewTop(pt: Point, es: EventSupport): BaseView | undefined {
		return findViewTop(this.views, pt, es, undefined, undefined);
	}
}
