import { BookingsModel, CanvasView, CellPage, CellsModel, ColumnModel } from '../src';
import { logMeasureTime } from '../src/utils';
import { COLOR } from '../src/view/utils';

const canvasContainer = document.createElement('div');
canvasContainer.style.width = '100%';
canvasContainer.style.height = '100%';
canvasContainer.style.position = 'relative';
document.body.append(canvasContainer);

const canvasView = await CanvasView.create(canvasContainer);
canvasView.startTick();

logMeasureTime();
const columnNum = 100;
const rowNum = 100;

const cellsModel: CellsModel = {
	width: 32,
	height: 24,
	multiHeads: [[]],
	columnLineFollowHeadIndex: 0
};

for (let i = 0; i < columnNum; i++) {
	cellsModel.multiHeads[0].push({ index: i, text: i.toString() });
}

const columnModel: ColumnModel = {
	multiHeads: [],
	rows: []
};

columnModel.multiHeads.push([
	{ text: 'Col 1', width: 96 },
	{ text: 'Col 2', width: 96 },
	{ text: 'Col 3', width: 96 }
]);

for (let i = 0; i < rowNum; i++) {
	if (i % 3 === 0) {
		columnModel.rows.push([
			{ text: i.toString(), width: 96 },
			{ text: i.toString(), width: 96 },
			{ text: i.toString(), width: 96 }
		]);
	} else {
		columnModel.rows.push([{ text: i.toString(), width: 288 }]);
	}
}

const bookingsModel: BookingsModel = {
	bookings: []
};

const colors = [
	[COLOR.AKE, COLOR.ENTAN],
	[COLOR.KUCHIBA, COLOR.HANABA],
	[COLOR.HIWAMOEGI, COLOR.YANAGIZOME]
];

columnModel.rows.forEach((v, i) => {
	// if (i % 3 !== 0) {
	const columnBookings = [];
	for (let i = 0; i < columnNum; i += 1) {
		const colorIndex = Math.floor((Math.random() * 10) % 3);
		// if (Math.random() > 0.5) {
		columnBookings.push({
			i: i,
			w: 32,
			t: 'Booking',
			c: colors[colorIndex][0],
			h: colors[colorIndex][1]
		});
		// }
	}
	bookingsModel.bookings.push(columnBookings);
	// } else {
	// 	bookingsModel.bookings.push([]);
	// }
});
logMeasureTime('Generate Date');

const page = CellPage.new(columnModel, bookingsModel, cellsModel);
page.updateFromModel();

canvasView.selectPage(canvasView.addPage(page));
