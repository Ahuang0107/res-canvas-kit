import { CanvasView, CellPage } from '../src';
import { logMeasureTime } from '../src/utils';
import { Booking, Rows } from '../src/plugin/cell/model';
import data from './data.json';

const canvasContainer = document.createElement('div');
canvasContainer.style.width = '100%';
canvasContainer.style.height = '100%';
canvasContainer.style.position = 'relative';
document.body.append(canvasContainer);

const canvasView = await CanvasView.create(canvasContainer);
canvasView.startTick();

logMeasureTime();
const rows: Rows = new Map();
type DataType = { staff: string; children: { engage: string; bookings: Booking[] }[] }[];
const typedData = data as unknown as DataType;
typedData.forEach((v) => {
	const children = new Map();
	v.children.forEach((c) => {
		children.set(c.engage, c.bookings);
	});
	rows.set(v.staff, children);
});
logMeasureTime('Generate Date');

const page = CellPage.new(32, 24);
page.flush(rows);
page.flushBackground();

canvasView.selectPage(canvasView.addPage(page));
