import _ from "lodash";
import type { Config } from "testplane";
import { STORYBOOK_SET_NAME, STORYBOOK_KNOWN_PATH_ENDINGS } from "./constants";

const trimUrlEnding = (urlObj: URL, ending: string): void => {
    const pathName = _.trimEnd(urlObj.pathname, "/");

    if (pathName.endsWith(ending)) {
        urlObj.pathname = pathName.slice(0, -ending.length);
    }
};

const getFilteredBrowserIds = (config: Config, browserIds: Array<string | RegExp>): string[] => {
    const allBrowserIds = config.getBrowserIds();

    if (_.isEmpty(browserIds)) {
        return allBrowserIds;
    }

    return allBrowserIds.filter(browserId => {
        return browserIds.some(id => {
            if (_.isString(id)) {
                return id === browserId;
            }

            return id.test(browserId);
        });
    });
};

export const getStorybookPathEndingWith = (url: string, pathEnding: string): string => {
    const urlObj = new URL(url);

    STORYBOOK_KNOWN_PATH_ENDINGS.forEach(ending => trimUrlEnding(urlObj, ending));

    urlObj.pathname = _.trimEnd(urlObj.pathname, "/") + `/${pathEnding}`;

    return urlObj.toString();
};

export const patchSystemExtensions = (config: Config): void => {
    if (!config.system.fileExtensions.includes(".js")) {
        config.system.fileExtensions.push(".js");
    }
};

export const patchTestplaneSets = (
    config: Config,
    {
        browserIds,
        files,
        unsafeAllowOtherTests = false,
    }: { browserIds: Array<string | RegExp>; files: string[]; unsafeAllowOtherTests?: boolean },
): void => {
    const browsers = getFilteredBrowserIds(config, browserIds);
    const autoStorybookSet = { browsers, files };

    if (unsafeAllowOtherTests) {
        config.sets = config.sets || {};
        config.sets[STORYBOOK_SET_NAME] = autoStorybookSet;
    } else {
        config.sets = {
            [STORYBOOK_SET_NAME]: {
                browsers,
                files,
            },
        };
    }
};

export const patchTestplaneBaseUrl = (config: Config, baseUrl: string): void => {
    config.baseUrl = baseUrl;

    config.getBrowserIds().forEach(browserId => {
        const browserConfig = config.forBrowser(browserId);

        browserConfig.baseUrl = baseUrl;
    });
};

export const disableTestplaneIsolation = (config: Config, browserIds: Array<string | RegExp>): void => {
    const browsers = getFilteredBrowserIds(config, browserIds);

    config.isolation = false;

    browsers.forEach(browserId => {
        const browserConfig = config.forBrowser(browserId);

        browserConfig.isolation = false;
    });
};
