'use strict';

const path      = require('path');
const fs        = require('fs');
const promisify = require('util').promisify;

class RouteLoader {
    /**
     * @param {boolean} useRequireCache
     */
    constructor(useRequireCache = true) {
        this._useRequireCache = useRequireCache;
    }

    /**
     * @param {{}} app
     * @param {express} expressApp
     * @param {string} directory
     * @private
     */
    async _recursiveAsyncLoad(app, expressApp, directory) {
        await Promise.all(
            (await promisify(fs.readdir)(directory)).map(
                async file => {
                    const filePath    = path.resolve(directory, file);
                    const isDirectory = (await promisify(fs.stat)(filePath)).isDirectory();

                    if (isDirectory) {
                        await this._recursiveAsyncLoad(app, expressApp, filePath);
                    } else {
                        if (!this._useRequireCache) {
                            delete require.cache[require.resolve(filePath)];
                        }

                        expressApp.use(require(filePath)(app));
                    }
                }
            )
        );
    }

    /**
     * @param {{}} app
     * @param {express} expressApp
     * @param {string} appRootPath
     * @param {[]}  routeDirPaths
     */
    async load(app, expressApp, appRootPath, routeDirPaths) {
        await Promise.all(
            routeDirPaths.map(
                async routeDirPath => await this._recursiveAsyncLoad(
                    app, expressApp, path.resolve(appRootPath, routeDirPath)
                )
            )
        );
    }
}

module.exports = RouteLoader;
