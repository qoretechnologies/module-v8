/* Get all the default exports from the folders inside this folder */
import fs from 'fs';
import path from 'path';
import { IQoreAppWithActions } from '../global/models/qore';

const appsDir = path.resolve(__dirname);
const apps: Record<string, IQoreAppWithActions> = {};

function importIndexFilesFromDir(dir: string) {
  fs.readdirSync(dir).forEach((subDir) => {
    const fullPath = path.join(dir, subDir);
    const indexPath = path.join(fullPath, 'index.js');

    if (fs.statSync(fullPath).isDirectory() && fs.existsSync(indexPath)) {
      apps[subDir] = require(indexPath).default;
    }
  });
}

importIndexFilesFromDir(appsDir);

export default apps;
