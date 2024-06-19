import { UUID, UNAME, REG_TIME } from '../../../config/global_config';
import { SET_DEVICE_INFO } from '../../../config/redux';

export default function (state = {
  uuid: "",
  uname: "",
  rtime: 0
}, action : object) {
  if(action.type === SET_DEVICE_INFO) {
      sessionStorage.setItem(UUID, action.uuid);
      sessionStorage.setItem(UNAME, action.uname);
      sessionStorage.setItem(REG_TIME, action.rtime);
      return Object.assign({}, state, {
        uuid: action.uuid,
        uname: action.uname,
        rtime: action.rtime
      });
  }else if(state.uuid === "") {
    state.uuid = sessionStorage.getItem(UUID) == null ? "" : sessionStorage.getItem("device.uuid");
    state.uname = sessionStorage.getItem(UNAME) == null ? "" : sessionStorage.getItem("device.uname");
    state.rtime = sessionStorage.getItem(REG_TIME) == null ? 0 : sessionStorage.getItem("device.rtime") as number;
  }
  return state;
}