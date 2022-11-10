type LogLabel = 'font' | 'total render' | 'page render' | 'load' | 'page prebuild';
const OPEN_LOG_LABELS: LogLabel[] = [
	'font',
	'total render',
	'page render',
	'load',
	'page prebuild'
];

export function info(label: LogLabel, message: string) {
	if (OPEN_LOG_LABELS.includes(label)) {
		console.info(`[${label}] ${message}`);
	}
}
