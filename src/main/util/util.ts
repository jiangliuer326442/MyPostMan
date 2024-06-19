/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';
import { app } from 'electron';

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

export async function genUUID() {
  let si = require('systeminformation');
  let staticData = await si.getStaticData();
  let serial = {
    systemSerial: staticData.system.serial, //系统串号
    baseboardSerial: staticData.baseboard.serial, //主板串号
    chassisSerial: staticData.chassis.serial, //基座串号
    diskSerial: staticData.diskLayout[0].serialNum, //第一块磁盘的串号
    memSerial: staticData.memLayout[0].serialNum, //第一个内存的串号
  }
  let arr = await si.networkInterfaces();
  let networkInterfaceDefault = await si.networkInterfaceDefault();
  let [item] = arr.filter(v => v.iface == networkInterfaceDefault);
  serial.mac = item.mac;
  let serialNumStr = JSON.stringify(serial);
  let crypto = require('crypto');
  let serialHash = crypto.createHash('sha256').update(serialNumStr).digest('hex');
  return serialHash;
}

const RESOURCES_PATH = app.isPackaged
? path.join(process.resourcesPath, 'assets')
: path.join(__dirname, '../../../assets');

export function getAssetPath(...paths: string[]): string {
  return path.join(RESOURCES_PATH, ...paths);
}

export function base64Encode(data : string) : string {
  const base64Str = Buffer.from(data).toString('base64');
  return base64Str;
}

export function base64Decode(base64Str : string) : string {
  const decodedStr = Buffer.from(base64Str, 'base64').toString();
  return decodedStr;
}