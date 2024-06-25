import { BrowserWindow } from 'electron';
import userInitFunc from './user';
import windowInitFunc from './window';
import MarkdownInitFunc from './markdown';
import PostManInitFunc from './postman';
import UpdaterInitFunc from './updater';
import ProductInitFunc from './product';

export default function (mainWindow : BrowserWindow){
    userInitFunc();
    windowInitFunc(mainWindow);
    MarkdownInitFunc(mainWindow);
    PostManInitFunc();
    UpdaterInitFunc();
    ProductInitFunc();
}