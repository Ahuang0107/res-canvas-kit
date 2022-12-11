/**
 * 多个key以及和key一对一关联的Row数据组成的Rows就是一个表格
 */
export type Rows = Map<string, Row>;

/**
 * 一个Row有多个key以及和key一对一关联的bookings数据
 */
export type Row = Map<string, Booking[]>;

export type Booking = {
	start: number;
	end: number;
};
