import invariant from 'ts-invariant';

export function info(label = 'Unknown', message = '') {
	console.info(`[${label}] ${message}`);
}

const timer: number[] = [];

/**
 * 不传递任何参数开始一次 time measure
 * 传递参数结束一次 time measure 并输出日志
 * @param label
 * @param message
 */
export function logMeasureTime(label?: string, message?: string) {
	if (!label) {
		timer.push(Date.now());
	} else {
		const time = timer.pop();
		invariant(time, 'calling measure end time more than measure start time');
		if (!message) {
			console.info(`[${label}] cost: ${Date.now() - time}`);
		} else {
			console.info(`[${label}] ${message} cost: ${Date.now() - time}`);
		}
	}
}
