import { getdayjs } from '../../util';

import {
  SHOW_ADD_PROPERTY_MODEL,
  SHOW_EDIT_PROPERTY_MODEL,
  GET_ENV_VALS
} from '../../../config/redux';

import {
    PRJ, ENV
} from '../../../config/global_config';

import { 
    TABLE_ENV_VAR_FIELDS,
} from '../../../config/db';

let env_var_pname = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_NAME;
let env_var_pval = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_VAR;
let env_var_uname = TABLE_ENV_VAR_FIELDS.FIELD_CUNAME;
let env_var_ctime = TABLE_ENV_VAR_FIELDS.FIELD_CTIME;

export default function (state = {
    envVarListColumn: [
        {
            title: '参数名称',
            dataIndex: env_var_pname,
            width: 100,
          },
          {
            title: '参数值',
            dataIndex: env_var_pval,
            ellipsis: true,
          },
          {
            title: '创建人',
            dataIndex: env_var_uname,
            width: 100,
            ellipsis: true,
          },
          {
              title: '创建时间',
              dataIndex: env_var_ctime,
              width: 120,
              render: (time) => { return getdayjs(time).format("YYYY-MM-DD") },
          },
    ],
    showAddPropertyModelFlg: false,
    env: "",
    prj: "",
    pname: "",
    pvalue: "",
    list: []
  }, action : object) {
    switch(action.type) {
        case GET_ENV_VALS:
            let list = [];
            action.env_vars.map(envVar => {
                envVar.key = envVar[env_var_pname] + envVar[env_var_pval];
                list.push(envVar);
            });
            localStorage.setItem(PRJ, action.prj);
            localStorage.setItem(ENV, action.env);
            return Object.assign({}, state, {
              prj: action.prj,
              env: action.env,
              list
            });
        case SHOW_ADD_PROPERTY_MODEL:
            return Object.assign({}, state, {
              showAddPropertyModelFlg : action.open,
              pname: "",
              pvalue: "",
        });
        case SHOW_EDIT_PROPERTY_MODEL:
          return Object.assign({}, state, {
            showAddPropertyModelFlg : action.open,
            pname : action.pname,
            pvalue : action.pvalue,
          });
        default:
            state.prj = localStorage.getItem(PRJ);
            state.env = localStorage.getItem(ENV);
            return state;
    }
}