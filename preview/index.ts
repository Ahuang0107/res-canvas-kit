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

setTimeout(() => {
	canvasView.loading = false;
}, 5000);

canvasView.selectPage(canvasView.addPage(CellPage.default()));
const page = canvasView.currentPage;

if (page && page instanceof CellPage) {
	page.controller.option.yMin = 0;
	page.controller.option.yMax = 1920 - 96;
	page.addFixedViews([
		CellView.from(
			0,
			0,
			352,
			64,
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
			32,
			160,
			32,
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
			32,
			96,
			32,
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
			32,
			96,
			32,
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

	for (let y = 0; y < 1920; y += 32) {
		page.addXFixedViews([
			CellView.from(
				0,
				y,
				160,
				32,
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
				{ supportHover: true, supportFocus: true }
			)
		]);
		page.addXFixedViews([
			CellView.from(
				160,
				y,
				96,
				32,
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
				{ supportHover: true, supportFocus: true }
			)
		]);
		page.addXFixedViews([
			CellView.from(
				256,
				y,
				96,
				32,
				{
					text: ['Assurance', 'CBS', 'Team 1', 'Team 2', 'Team 3', 'Team 4', 'Team 5', 'Team 6'][
						Math.round((Math.random() * 10) % 7)
					],
					style: {
						fillColor: CanvasKitUtil.CanvasKit.Color(240, 240, 240),
						strokeColor: CanvasKitUtil.CanvasKit.Color(68, 67, 89)
					}
				},
				{ supportHover: true, supportFocus: true }
			)
		]);
	}

	for (let x = -3840; x < 3840; x += 32) {
		if (x % 224 === 0) {
			page.addYFixedViews([
				CellView.from(
					x,
					0,
					224,
					32,
					{
						text: 'Dec 2022',
						style: {
							fillColor: CanvasKitUtil.CanvasKit.Color(217, 217, 217),
							strokeColor: CanvasKitUtil.CanvasKit.Color(68, 67, 89)
						}
					},
					{ supportHover: true, supportFocus: true }
				)
			]);
		}
		page.addYFixedViews([
			CellView.from(
				x,
				32,
				32,
				32,
				{
					text: ['Sun.', 'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fir.', 'Sat.'][
						Math.round((Math.random() * 10) % 6)
					],
					style: {
						fillColor: CanvasKitUtil.CanvasKit.Color(217, 217, 217),
						strokeColor: CanvasKitUtil.CanvasKit.Color(68, 67, 89)
					}
				},
				{ supportHover: true, supportFocus: true }
			)
		]);
	}

	for (let x = -3840; x < 3840; x += 32) {
		let bgColor = CanvasKitUtil.CanvasKit.WHITE;
		if (x % 224 === 0 || x % 224 === 32) {
			bgColor = CanvasKitUtil.CanvasKit.Color(221, 221, 221);
		}
		for (let y = 0; y < 1920; y += 32) {
			// 这里添加的是表格的所有空格子，将z轴设为1
			page.addViews([
				CellView.from(
					x,
					y,
					32,
					32,
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
					{ supportHover: true, supportFocus: true },
					undefined,
					1
				)
			]);
		}
		if (x % 224 === 0) {
			for (let y = 0; y < 1920; y += 32) {
				// 这里添加的是booking的格子，将z轴设为10
				const random = Math.round((Math.random() * 10) % 6);
				page.addViews([
					CellView.from(
						x + 32 * random,
						y,
						32 * Math.max(Math.round((Math.random() * 10) % 8) - random, 3),
						32,
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
						{ supportHover: true, supportFocus: true, supportMove: true, supportStretch: true },
						undefined,
						10
					)
				]);
			}
		}
	}
}
