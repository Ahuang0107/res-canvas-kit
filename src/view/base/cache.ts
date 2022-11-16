import {
	Canvas,
	Paint,
	Paragraph,
	ParagraphStyle,
	SkottieAnimation
} from '@skeditor/canvaskit-wasm';
import { Point } from '../../base/point';
import { Rect } from '../../base/rect';
import { CanvasKitUtil } from '../../utils';

export type ComponentCaches = {
	// cache 是不管处于什么状态都会渲染的
	cache?: DrawCache[];
	// normalCache 是非hover/focus状态渲染
	normalCache?: DrawCache[];
	// hoverCache 仅在hover状态渲染
	hoverCache?: DrawCache[];
	// focusCache 仅在focus状态渲染
	focusCache?: DrawCache[];
};

export type DrawCache = RectCache | ParaCache | TextCache | LineCache | AnimaCache;

abstract class Cache {
	protected constructor(public frame: Rect) {}

	abstract draw(canvas: Canvas): void;
}

export class RectCache extends Cache {
	constructor(rect: Rect, public paint: Paint) {
		super(rect);
	}

	draw(canvas: Canvas) {
		canvas.drawRect(this.frame.toFloat32Array(), this.paint);
	}
}

/**
 * 因为创建太多Paragraph会超过WASM的MAXIMUM_MEMORY，默认是2G
 * 虽然可以增加但是目前先用不增加的解决方案
 * 将ParaCache修改为实时创建ParagraphBuilder和Paragraph，绘制完delete对象，防止内存溢出
 * 但是渲染效率会降低
 * perf设置为true则是依旧使用存储Paragraph的逻辑，提高了绘制效率
 * 目前看ParaCache主要是数量多就很耗时，所以要控制页面上的ParaCache尽量少
 */
export class ParaCache extends Cache {
	_para?: Paragraph;

	constructor(
		rect: Rect,
		public text: string,
		public paraStyle: ParagraphStyle,
		public pos: Point,
		perf = false
	) {
		super(rect);
		if (perf) {
			// todo 这里创建builder对象和不创建看起来差距特别大
			const builder = CanvasKitUtil.CanvasKit.ParagraphBuilder.Make(
				this.paraStyle,
				CanvasKitUtil.FontMgr
			);
			builder.addText(this.text);
			const para = builder.build();
			para.layout(this.frame.width);
			this._para = para;
			builder.delete();
		}
	}

	draw(canvas: Canvas) {
		const pos = this.frame.leftTop.add(this.pos);
		if (this._para) {
			this._para.layout(this.frame.width);
			canvas.drawParagraph(this._para, pos.x, pos.y);
		} else {
			const builder = CanvasKitUtil.CanvasKit.ParagraphBuilder.Make(
				this.paraStyle,
				CanvasKitUtil.FontMgr
			);
			builder.addText(this.text);
			const para = builder.build();
			para.layout(this.frame.width);
			canvas.drawParagraph(para, pos.x, pos.y);
			builder.delete();
			para.delete();
		}
	}
}

/**
 * TextCache的渲染效率确实要更高一点，能达到ParaCache的4倍，手动layout很挺快的
 * 对于只渲染一行的数据，还是TextCache效率更高
 * todo text layout的逻辑
 */
export class TextCache extends Cache {
	constructor(frame: Rect, public text: string, public pos: Point) {
		super(frame);
	}

	draw(canvas: Canvas) {
		const pos = this.frame.leftTop.add(this.pos);
		const font = CanvasKitUtil.font(12);
		let width = 0;
		let actualText = this.text;
		for (let i = 0; i < this.text.length; i += 1) {
			const widths = font.getGlyphWidths(font.getGlyphIDs(this.text.charAt(i)));
			width += widths[0];
			if (width > this.frame.width) {
				actualText = this.text.slice(0, i - 3) + '...';
				break;
			}
		}
		canvas.drawText(
			actualText,
			pos.x,
			pos.y,
			CanvasKitUtil.fillPaint(CanvasKitUtil.CanvasKit.BLACK),
			font
		);
	}
}

export class LineCache extends Cache {
	constructor(frame: Rect, public paint: Paint) {
		super(frame);
	}

	draw(canvas: Canvas) {
		canvas.drawLine(
			this.frame.left,
			this.frame.top,
			this.frame.right,
			this.frame.bottom,
			this.paint
		);
	}
}

export class AnimaCache extends Cache {
	animation: SkottieAnimation;
	firstFrame: number;

	constructor(frame: Rect, json: never) {
		super(frame);
		this.animation = CanvasKitUtil.CanvasKit.MakeAnimation(JSON.stringify(json));
		this.firstFrame = new Date().getTime();
	}

	draw(canvas: Canvas): void {
		const now = new Date().getTime();
		const seek = ((now - this.firstFrame) / (this.animation.duration() * 1000)) % 1;
		this.animation.seek(seek);
		this.animation.render(canvas, this.frame.toFloat32Array());
	}
}
