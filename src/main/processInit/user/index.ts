import log from 'electron-log';
import { ipcMain } from 'electron';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs-extra';
import { ChannelsUserInfoStr } from '../../../config/global_config';
import { registerUser, getUUID, getUName, getRTime } from '../../store/config/user';
import { uuidPath, writeFile } from '../uuid';
import { genUUID } from '../../util/util';

let readayEvent = null;
let intervalId;

function notifyUserInfo() {
  if(readayEvent !== null) {
    let uuid = getUUID();
    let uname = getUName();
    let rtime = getRTime();
    readayEvent.reply(ChannelsUserInfoStr, uuid, uname, rtime);
    clearInterval(intervalId);
  }
}

export default function() {
  ipcMain.on(ChannelsUserInfoStr, (event, arg) => {
    if(arg === 'ping') {
      readayEvent = event;
    }
  });

  if(fs.existsSync(uuidPath)){
    intervalId = setInterval(notifyUserInfo, 1000);
  } else {
    genUUID().then(async uuid => {
        let salt = uuidv4() as string;
        registerUser(uuid, salt);
        writeFile(uuid, salt);
        intervalId = setInterval(notifyUserInfo, 1000);
    }).catch(err => log.error(err));
  }
}