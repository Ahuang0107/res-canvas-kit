import { Canvas, GrDirectContext, Surface } from '@skeditor/canvaskit-wasm';
import { CanvasKitUtil, info } from '../utils';
import { BehaviorSubject, Observable } from 'rxjs';
import { Rect } from '../base/rect';
import { Disposable } from '../base/disposable';
import invariant from 'ts-invariant';
import { Page } from './page/page';
import { PageState } from './page/page-state';
import { debounceTime } from 'rxjs/operators';
import { PointerController } from '../controller/poniter-controller';

export class CanvasView extends Disposable {
	static currentContext: CanvasView;
	canvasEl$: BehaviorSubject<HTMLCanvasElement>;
	skCanvas!: Canvas;
	pageState = new PageState();
	pages: Page[] = [];
	currentPage?: Page;
	frame = new Rect();
	private readonly grContext: GrDirectContext;
	private skSurface?: Surface;
	private dpi = 1;
	private dirty = true;

	protected constructor(private foreignEl: HTMLElement) {
		super();
		CanvasView.currentContext = this;

		const { canvasEl, grContext } = this.createCanvasEl();
		this.canvasEl$ = new BehaviorSubject(canvasEl);
		this.grContext = grContext;
		this.attachParentNode(foreignEl);

		this._disposables.push(
			this.pageState.changed.subscribe(() => {
				this.markDirty();
			}),

			new PointerController(this)
		);
	}

	static async create(foreignEl: HTMLElement) {
		await CanvasKitUtil.loadCanvasKit();
		await CanvasKitUtil.loadFont();
		const canvasView = new CanvasView(foreignEl);
		canvasView.currentPage = new Page();
		return canvasView;
	}

	startTick() {
		const handler = () => {
			if (this._disposed) return;
			this.render();
			// requestAnimationFrame(handler);
			setTimeout(handler, 16);
		};
		// requestAnimationFrame(handler);
		setTimeout(handler, 16);
	}

	markDirty() {
		this.dirty = true;
	}

	pushPage(page: Page): number {
		return this.pages.push(page);
	}

	selectPage(index: number) {
		this.currentPage = this.pages[index];
	}

	clearPage() {
		this.pages = [];
	}

	/**
	 * canvas 应该在 resize 事件触发的时候调整大小
	 * width 和 style.width 都要手动控制以保持一致, 才能不变形。
	 */
	private createCanvasEl(): { canvasEl: HTMLCanvasElement; grContext: GrDirectContext } {
		const canvasEl = document.createElement('canvas');
		canvasEl.style.display = 'block';
		const grContext = CanvasKitUtil.CanvasKit.MakeGrContext(
			CanvasKitUtil.CanvasKit.GetWebGLContext(canvasEl)
		);
		invariant(grContext, 'fail to get GrDirectContext');
		return { canvasEl, grContext };
	}

	private attachParentNode(el: HTMLElement) {
		const canvasEl = this.canvasEl$.value;
		invariant(canvasEl && !canvasEl.parentElement, 'Should not attach again!');
		el.appendChild(canvasEl);
		this.doResize();

		this._disposables.push(
			new Observable((sub) => {
				const ro = new ResizeObserver(() => {
					sub.next();
				});
				ro.observe(el);
				return () => ro.disconnect();
			})
				.pipe(debounceTime(100))
				.subscribe(() => {
					this.doResize();
				})
		);
	}

	private doResize(force = false) {
		const bounds = this.foreignEl.getBoundingClientRect();
		if (!force && this.frame.width === bounds.width && this.frame.height === bounds.height) {
			return;
		}

		const canvasEl = this.canvasEl$.value;

		this.frame.width = bounds.width;
		this.frame.height = bounds.height;
		this.dpi = window.devicePixelRatio;

		canvasEl.style.width = `${bounds.width}px`;
		canvasEl.style.height = `${bounds.height}px`;

		const canvasWidth = this.frame.width * this.dpi;
		const canvasHeight = this.frame.height * this.dpi;

		canvasEl.width = canvasWidth;
		canvasEl.height = canvasHeight;
		this.markDirty();
	}

	private createSkSurfaceAndCanvas() {
		this.skSurface?.delete();
		this.skSurface = undefined;
		const canvasEl = this.canvasEl$.value;
		if (!this.grContext) return;
		const surface = CanvasKitUtil.CanvasKit.MakeOnScreenGLSurface(
			this.grContext,
			canvasEl.width,
			canvasEl.height,
			CanvasKitUtil.CanvasKit.ColorSpace.SRGB
		);
		if (!surface) return;
		this.skSurface = surface;

		this.skCanvas = this.skSurface.getCanvas();
		invariant(this.skCanvas, 'Cant create sk canvas');
	}

	private render() {
		if (!this.dirty) return;
		const start = Date.now();
		this.createSkSurfaceAndCanvas();
		if (!this.skSurface) return;
		this.skCanvas.clear(CanvasKitUtil.CanvasKit.TRANSPARENT);
		if (this.currentPage) {
			this.skCanvas.save();
			this.skCanvas.scale(this.dpi, this.dpi);
			this.currentPage?.prebuild();
			this.currentPage?.render();
			this.skCanvas.restore();
			this.skSurface.flush();
			this.dirty = this.currentPage.autoDirty;
		}
		info('total render', `costs: ${Date.now() - start}`);
	}
}
