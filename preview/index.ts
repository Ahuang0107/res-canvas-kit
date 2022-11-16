import { CanvasKitUtil, CanvasView, CellPage, CellView } from '../src';

document.documentElement.style.width = '100%';
document.documentElement.style.height = '100%';
document.documentElement.style.margin = '0';
document.body.style.width = '100%';
document.body.style.height = '100%';
document.body.style.margin = '0';

const canvasContainer = document.createElement('div');
canvasContainer.style.width = '100%';
canvasContainer.style.height = '100%';
canvasContainer.style.position = 'relative';
document.body.append(canvasContainer);

const canvasView = await CanvasView.create(canvasContainer);
canvasView.loading = true;
canvasView.startTick();

canvasView.selectPage(canvasView.addPage(CellPage.default()));
const page = canvasView.currentPage;

const rowHeight = 24;
const rowNum = 240;
const columnWidth = 32;
const columnNum = 480;

if (page && page instanceof CellPage) {
	page.controller.option.yMin = 0;
	page.controller.option.yMax = (rowNum - 3) * rowHeight;
	page.controller.option.xMin = (-columnNum / 2) * columnWidth;
	page.controller.option.xMax = (columnNum / 2 - 42) * columnWidth;
	page.addFixedViews([
		CellView.from(
			0,
			0,
			352,
			rowHeight * 2,
			{
				style: {
					fillColor: CanvasKitUtil.CanvasKit.Color(217, 217, 217),
					strokeColor: CanvasKitUtil.CanvasKit.Color(68, 67, 89)
				}
			},
			{}
		)
	]);
	page.addFixedViews([
		CellView.from(
			0,
			rowHeight,
			160,
			rowHeight,
			{
				text: 'Resource Name',
				style: {
					fillColor: CanvasKitUtil.CanvasKit.Color(217, 217, 217),
					strokeColor: CanvasKitUtil.CanvasKit.Color(68, 67, 89)
				}
			},
			{}
		)
	]);
	page.addFixedViews([
		CellView.from(
			160,
			rowHeight,
			96,
			rowHeight,
			{
				text: 'Business Unit',
				style: {
					fillColor: CanvasKitUtil.CanvasKit.Color(217, 217, 217),
					strokeColor: CanvasKitUtil.CanvasKit.Color(68, 67, 89)
				}
			},
			{}
		)
	]);
	page.addFixedViews([
		CellView.from(
			256,
			rowHeight,
			96,
			rowHeight,
			{
				text: 'Operating Unit',
				style: {
					fillColor: CanvasKitUtil.CanvasKit.Color(217, 217, 217),
					strokeColor: CanvasKitUtil.CanvasKit.Color(68, 67, 89)
				}
			},
			{}
		)
	]);

	for (let rowIndex = 0; rowIndex < rowNum; rowIndex += 1) {
		const y = rowIndex * rowHeight;
		page.addXFixedViews([
			CellView.from(
				0,
				y,
				160,
				rowHeight,
				{
					text: [
						'Kira Fowler',
						'Crystal Leblanc',
						'Eleanor Friedman',
						'Aimee Strong',
						'Carly Long',
						'Saskia Hubbard',
						'Hafsa Sandoval',
						'Paula Bradford'
					][Math.round((Math.random() * 10) % 7)],
					style: {
						fillColor: CanvasKitUtil.CanvasKit.Color(240, 240, 240),
						strokeColor: CanvasKitUtil.CanvasKit.Color(68, 67, 89)
					}
				},
				{ hover: true, focus: true }
			)
		]);
		page.addXFixedViews([
			CellView.from(
				160,
				y,
				96,
				rowHeight,
				{
					text: [
						'Hangzhou',
						'Shanghai',
						'Wuhan',
						'Hainan',
						'Beijing',
						"Xi'an",
						'Nanjing',
						'Dalian'
					][Math.round((Math.random() * 10) % 7)],
					style: {
						fillColor: CanvasKitUtil.CanvasKit.Color(240, 240, 240),
						strokeColor: CanvasKitUtil.CanvasKit.Color(68, 67, 89)
					}
				},
				{ hover: true, focus: true }
			)
		]);
		page.addXFixedViews([
			CellView.from(
				256,
				y,
				96,
				rowHeight,
				{
					text: ['Assurance', 'CBS', 'Team 1', 'Team 2', 'Team 3', 'Team 4', 'Team 5', 'Team 6'][
						Math.round((Math.random() * 10) % 7)
					],
					style: {
						fillColor: CanvasKitUtil.CanvasKit.Color(240, 240, 240),
						strokeColor: CanvasKitUtil.CanvasKit.Color(68, 67, 89)
					}
				},
				{ hover: true, focus: true }
			)
		]);
	}

	for (let columnIndex = -columnNum / 2; columnIndex < columnNum / 2; columnIndex += 1) {
		const x = columnIndex * columnWidth;
		if (columnIndex % 7 === 0) {
			page.addYFixedViews([
				CellView.from(
					x,
					0,
					columnWidth * 7,
					rowHeight,
					{
						text: 'Dec 2022',
						style: {
							fillColor: CanvasKitUtil.CanvasKit.Color(217, 217, 217),
							strokeColor: CanvasKitUtil.CanvasKit.Color(68, 67, 89)
						}
					},
					{ hover: true, focus: true }
				)
			]);
		}
		page.addYFixedViews([
			CellView.from(
				x,
				rowHeight,
				columnWidth,
				rowHeight,
				{
					text: ['Sun.', 'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fir.', 'Sat.'][
						Math.round((Math.random() * 10) % 6)
					],
					style: {
						fillColor: CanvasKitUtil.CanvasKit.Color(217, 217, 217),
						strokeColor: CanvasKitUtil.CanvasKit.Color(68, 67, 89)
					}
				},
				{ hover: true, focus: true }
			)
		]);
	}

	for (let columnIndex = -columnNum / 2; columnIndex < columnNum / 2; columnIndex += 1) {
		const x = columnIndex * columnWidth;
		let bgColor = CanvasKitUtil.CanvasKit.WHITE;
		if (columnIndex % 7 === 0 || columnIndex % 7 === 1) {
			bgColor = CanvasKitUtil.CanvasKit.Color(221, 221, 221);
		}
		for (let rowIndex = 0; rowIndex < rowNum; rowIndex += 1) {
			const y = rowIndex * rowHeight;
			// 这里添加的是表格的所有空格子，将z轴设为1
			page.addViews([
				CellView.from(
					x,
					y,
					32,
					rowHeight,
					{
						style: {
							fillColor: bgColor,
							strokeColor: CanvasKitUtil.CanvasKit.Color(128, 128, 128)
						},
						hoverStyle: {
							fillColor: CanvasKitUtil.CanvasKit.Color(240, 240, 240),
							strokeColor: CanvasKitUtil.CanvasKit.Color(128, 128, 128)
						},
						focusStyle: {
							fillColor: CanvasKitUtil.CanvasKit.Color(217, 217, 217),
							strokeColor: CanvasKitUtil.CanvasKit.Color(128, 128, 128)
						}
					},
					{ hover: true, focus: true },
					undefined,
					1
				)
			]);
		}
		if (columnIndex % 7 === 0) {
			for (let rowIndex = 0; rowIndex < rowNum; rowIndex += 1) {
				const y = rowIndex * rowHeight;
				// 这里添加的是booking的格子，将z轴设为10
				const random = Math.round((Math.random() * 10) % 6);
				page.addViews([
					CellView.from(
						x + 32 * random,
						y,
						32 * Math.max(Math.round((Math.random() * 10) % 8) - random, 3),
						rowHeight,
						{
							text: [
								'AUD2022-12 LT Suzhou',
								'AUP2022‐12 NB CR Gas',
								'IPO2020-12 Audit Support',
								'INT2021-06 CCB BR Anhui',
								'FAA2023-04 SUBGROUP Methode SH',
								'SPC2022-09 DNE',
								'NTS2012-09 PIM Audit'
							][Math.round((Math.random() * 10) % 6)],
							textSize: 10,
							style: {
								fillColor: [
									CanvasKitUtil.CanvasKit.Color(129, 199, 212),
									CanvasKitUtil.CanvasKit.Color(226, 148, 59),
									CanvasKitUtil.CanvasKit.Color(250, 214, 137)
								][Math.round((Math.random() * 10) % 2)],
								strokeColor: CanvasKitUtil.CanvasKit.Color(68, 67, 89)
							},
							hoverStyle: {
								fillColor: CanvasKitUtil.CanvasKit.Color(240, 240, 240),
								strokeColor: CanvasKitUtil.CanvasKit.Color(68, 67, 89)
							},
							focusStyle: {
								fillColor: CanvasKitUtil.CanvasKit.Color(217, 217, 217),
								strokeColor: CanvasKitUtil.CanvasKit.Color(68, 67, 89)
							}
						},
						{ hover: true, focus: true, move: true, stretch: true, delete: true },
						undefined,
						10
					)
				]);
			}
		}
	}
	// todo 一次性把所有的view都prebuild掉会有很长一段的页面空白期，
	//  同时loading的动画也是无法加载的，除非将loading动画放到这块canvas之外加载
	// 基本render的cost在60ms之内都是可以接受的
	// page.prebuild(true);
	canvasView.loading = false;
}
