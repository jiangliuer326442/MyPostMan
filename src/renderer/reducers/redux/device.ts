import { UUID, UNAME, REG_TIME, APPNAME, APPVERSION } from '../../../config/global_config';
import { SET_DEVICE_INFO } from '../../../config/redux';
import { isStringEmpty } from '../../util';

export default function (state = {
  uuid: "",
  uname: "",
  appName: "",
  appVersion: "",
  rtime: 0
}, action : any) {
  if(action.type === SET_DEVICE_INFO) {
      let newState : any = {};

      if (action.uuid !== undefined) {
        sessionStorage.setItem(UUID, action.uuid);
        newState.uuid = action.uuid;
      }

      if (action.uname !== undefined) {
        sessionStorage.setItem(UNAME, action.uname);
        newState.uname = action.uname;
      }

      if (action.rtime !== undefined) {
        sessionStorage.setItem(REG_TIME, action.rtime);
        newState.rtime = action.rtime;
      }

      if (action.appName !== undefined) {
        sessionStorage.setItem(APPNAME, action.appName);
        newState.appName = action.appName;
      }

      if (action.appVersion !== undefined) {
        sessionStorage.setItem(APPVERSION, action.appVersion);
        newState.appVersion = action.appVersion;
      }
      
      return Object.assign({}, state, newState);
  }else if(state.uuid === "") {
    state.uuid = isStringEmpty(sessionStorage.getItem(UUID)) ? "" : sessionStorage.getItem(UUID) as string;
    state.uname = isStringEmpty(sessionStorage.getItem(UNAME)) ? "" : sessionStorage.getItem(UNAME) as string;
    state.rtime = isStringEmpty(sessionStorage.getItem(REG_TIME)) ? 0 : Number(sessionStorage.getItem(REG_TIME));
    state.appName = isStringEmpty(sessionStorage.getItem(APPNAME)) ? "" : sessionStorage.getItem(APPNAME) as string;
    state.appVersion = isStringEmpty(sessionStorage.getItem(APPVERSION)) ? "" : sessionStorage.getItem(APPVERSION) as string;
  }
  return state;
}