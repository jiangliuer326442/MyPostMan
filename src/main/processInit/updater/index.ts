import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { ipcMain } from 'electron';

import { 
    ChannelsAutoUpgradeStr, 
    ChannelsAutoUpgradeCheckStr, 
    ChannelsAutoUpgradeDownloadStr,
    ChannelsAutoUpgradeNewVersionStr, 
} from '../../../config/global_config';

export default function (){
    autoUpdater.logger = log;
    autoUpdater.fullChangelog = true;
    autoUpdater.disableWebInstaller = false;
    autoUpdater.autoDownload = false;
    autoUpdater.on('error', (error) => {
        log.error(['检查更新失败', error])
    });

    ipcMain.on(ChannelsAutoUpgradeStr, (event, action) => {
        if (action !== ChannelsAutoUpgradeCheckStr) return;
        autoUpdater.checkForUpdates().then(updateCheckResult => {
            if (updateCheckResult !== null) {
                event.reply(ChannelsAutoUpgradeStr, ChannelsAutoUpgradeNewVersionStr, updateCheckResult.versionInfo);
            }
        });
    });

    ipcMain.on(ChannelsAutoUpgradeStr, (event, action) => {
        if (action !== ChannelsAutoUpgradeDownloadStr) return;
        autoUpdater.downloadUpdate().then(paths => {
            log.info("downloadUpdate paths", paths);
            autoUpdater.quitAndInstall();
        });
    });
}