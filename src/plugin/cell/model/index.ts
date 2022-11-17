// 用来生成Model 1
export type CellsModel = {
	// 每个cell的长度
	width: number;
	// 每个cell的高度
	height: number;
	multiHeads: HeadModel[][];
	columnLineFollowHeadIndex: number;
};

type HeadModel = {
	index: number;
	text: string;
	width?: number;
};

// 用来生成Model 2
export type BookingsModel = {
	// booking组成的二维数组
	bookings: CellModel[][];
};

// booking数据对应Model
type CellModel = {
	index: number;
	width?: number;
	offset?: number;
	text?: string;
};

type WidthCellModel = {
	width: number;
	text?: string;
};

// 用来生成Model 3
export type ColumnModel = {
	// 包含列名和列宽信息
	multiHeads: WidthCellModel[][];
	// 数据的二维数组
	rows: WidthCellModel[][];
};
