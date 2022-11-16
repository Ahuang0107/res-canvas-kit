import { Canvas, GrDirectContext, Surface } from '@skeditor/canvaskit-wasm';
import { CanvasKitUtil, info } from '../utils';
import { BehaviorSubject, Observable } from 'rxjs';
import { Rect } from '../base/rect';
import { Disposable } from '../base/disposable';
import invariant from 'ts-invariant';
import { BasePage } from './page/base-page';
import { PageState } from './page/page-state';
import { debounceTime } from 'rxjs/operators';
import { PointerController } from '../controller/poniter-controller';
import { AnimaView } from './base/anima-view';

export class CanvasView extends Disposable {
	static currentContext: CanvasView;
	canvasEl$: BehaviorSubject<HTMLCanvasElement>;
	skCanvas!: Canvas;
	pageState = new PageState();
	pages: Map<string, BasePage> = new Map();
	currentPageId = '';
	frame = new Rect();
	loading = false;
	private readonly grContext: GrDirectContext;
	private skSurface?: Surface;
	private dpi = 1;
	private dirty = true;
	private loadingView: AnimaView;

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

		this.loadingView = AnimaView.new();
		this.loadingView.prebuild();

		const surface = CanvasKitUtil.CanvasKit.MakeOnScreenGLSurface(
			this.grContext,
			canvasEl.width,
			canvasEl.height,
			CanvasKitUtil.CanvasKit.ColorSpace.SRGB
		);
		if (!surface) return;
		this.skSurface = surface;
		this.skCanvas = surface.getCanvas();
	}

	get currentPage(): BasePage | undefined {
		return this.pages.get(this.currentPageId);
	}

	static async create(foreignEl: HTMLElement) {
		await CanvasKitUtil.loadCanvasKit();
		await CanvasKitUtil.loadFont();
		return new CanvasView(foreignEl);
	}

	startTick() {
		const handler = () => {
			if (this._disposed) return;
			if (this.loading) {
				this.loadingRender();
			} else {
				this.render();
			}
			// requestAnimationFrame(handler);
			setTimeout(handler, 16);
		};
		// requestAnimationFrame(handler);
		setTimeout(handler, 16);
	}

	markDirty() {
		this.dirty = true;
	}

	/**
	 * 创建一个新的page，可以再调用selectPage来切换到新创建的page
	 * @return 新创建的page的id
	 */
	addPage<T extends BasePage>(page: T): string {
		this.pages.set(page.id, page);
		return page.id;
	}

	/**
	 * 切换到指定的page
	 * @param id page的id，创建CanvasView时有一个默认page，可以用canvasView.currentPage.id拿到
	 */
	selectPage(id: string) {
		if (!this.pages.has(id)) return;
		this.currentPageId = id;
		this.markDirty();
	}

	/**
	 * 删除指定page，如果是当前page，则当前视图会消失
	 * @param id
	 */
	deletePage(id: string) {
		this.pages.delete(id);
		this.markDirty();
	}

	/**
	 * 清空所以page，当前page也会清空
	 */
	clearPage() {
		this.pages.clear();
		this.markDirty();
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
		// this.createSkSurfaceAndCanvas();
		if (!this.skSurface) return;
		this.skCanvas.clear(CanvasKitUtil.CanvasKit.TRANSPARENT);
		if (this.currentPage) {
			this.skCanvas.save();
			this.skCanvas.scale(this.dpi, this.dpi);
			this.currentPage?.prebuild();
			this.currentPage?.render();
			this.skCanvas.restore();
			this.skSurface.flush();
		}
		this.dirty = false;
		info('total render', `costs: ${Date.now() - start}`);
	}

	// todo 从loading状态切换到非loading状态时，会有一段时间loading动画无法继续加载，
	//  同时page view也还在加载，此时画面看上去是卡住的，这里该如何解决呢？
	//  创建一个新的<canvas/>来渲染page view，渲染完后再把原来的<canvas/>替换掉？
	private loadingRender() {
		if (!this.loading) return;
		const start = Date.now();
		// this.createSkSurfaceAndCanvas();
		if (!this.skSurface) return;
		this.skCanvas.clear(CanvasKitUtil.CanvasKit.TRANSPARENT);
		this.skCanvas.save();
		this.skCanvas.scale(this.dpi, this.dpi);
		this.loadingView.resize();
		this.loadingView.render();
		this.skCanvas.restore();
		this.skSurface.flush();
		info('anima render', `costs: ${Date.now() - start}`);
	}
}
