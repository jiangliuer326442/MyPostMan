import IDBExportImport from 'indexeddb-export-import';

import { 
    ChannelsDbStr, 
    ChannelsDbExportStr,
    ChannelsDbWriteStr,
    ChannelsDbImportStr,
    ChannelsUserInfoSetUserinfoStr,
    ChannelsUserInfoSetAppinfoStr,
    ChannelsUserInfoStr,
} from '../../config/global_config';

import { SET_DEVICE_INFO } from '../../config/redux';

/**
 * 处理消息通用类
 * @param dispatch 
 * @param cb 
 */
export default function(dispatch, cb) : void {
    if('electron' in window) {

        //备份数据库
        window.electron.ipcRenderer.on(ChannelsDbStr, (action, path) => {
            if (action === ChannelsDbExportStr) {
                const idbDatabase = window.db.backendDB();
                IDBExportImport.exportToJsonString(idbDatabase, (err, jsonString) => {
                    if (err) {
                        console.error(err);
                    } else {
                        window.electron.ipcRenderer.sendMessage(ChannelsDbStr, ChannelsDbWriteStr, path, jsonString);
                    }
                });
            }
        });

        //还原数据库
        window.electron.ipcRenderer.on(ChannelsDbStr, (action, jsonString) => {
            if (action === ChannelsDbImportStr) {
                const idbDatabase = window.db.backendDB();
                IDBExportImport.clearDatabase(idbDatabase, function(err) {
                    if (!err) {
                      IDBExportImport.importFromJsonString(idbDatabase, jsonString, function(err) {
                        if (!err) {
                          alert("数据库还原成功!");
                        //   window.electron.ipcRenderer.sendMessage(ChannelsDbStr, ChannelsDbImportSuccessStr);
                        }
                      });
                    }
                });
            }
        });

        window.electron.ipcRenderer.on(ChannelsUserInfoStr, (action, uuid, uname, rtime) => {
            if (action !== ChannelsUserInfoSetUserinfoStr) return;
            dispatch({
                type: SET_DEVICE_INFO,
                uuid,
                uname,
                rtime,
            });
        });

        //设置app信息
        window.electron.ipcRenderer.on(ChannelsUserInfoStr, (action, appName, appVersion) => {
            if (action !== ChannelsUserInfoSetAppinfoStr) return;
            dispatch({
                type: SET_DEVICE_INFO,
                appName,
                appVersion
            });
        });
    }
}