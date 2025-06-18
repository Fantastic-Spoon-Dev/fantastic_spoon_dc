import { Logger } from "seyfert";
import { LogLevels } from "seyfert/lib/common/it/logger";

export const logger = new Logger({
    name: 'FSD',
    logLevel: LogLevels.Debug,
    saveOnFile: true,
})

Logger.customize((logger, level, args) => {
    const date = new Date();
    return [
        `[${date.toISOString()}]`,
        `[${logger.name}]`,
        `[${Logger.prefixes.get(level)}]`,
        ...args
    ]
})

Logger.customizeFilename((logger) => {
    return `${logger.name}-${new Date().toISOString().split('T')[0]}.log`
})

Logger.saveOnFile = 'all';
