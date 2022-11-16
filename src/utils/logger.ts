type LogLabel =
	| 'font'
	| 'total render'
	| 'anima render'
	| 'page transform'
	| 'page sort'
	| 'page render'
	| 'load'
	| 'page prebuild'
	| 'unknown';
const OPEN_LOG_LABELS: LogLabel[] = [
	// 'font',
	// 'total render',
	// 'anima render'
	// 'page transform',
	// 'page sort',
	// 'page render'
	// 'load'
	// 'page prebuild'
];

export function info(label: LogLabel, message: string) {
	if (OPEN_LOG_LABELS.includes(label)) {
		console.info(`[${label}] ${message}`);
	}
}

export function logMT(label: LogLabel = 'unknown', op: () => number | void, message = '') {
	const start = Date.now();
	const num = op();
	info(label, message + `costs(${num}): ${Date.now() - start}`);
}
