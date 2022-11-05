type LogLabel = 'client' | 'store' | 'font' | 'render';
const OPEN_LOG_LABELS: LogLabel[] = ['store', 'render'];

class Logger {
	info(label: LogLabel, message: string) {
		if (OPEN_LOG_LABELS.includes(label)) {
			console.info(`[${label}] ${message}`);
		}
	}
}

export default new Logger();
