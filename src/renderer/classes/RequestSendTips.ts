import { v4 as uuidv4 } from 'uuid';

import { 
    ENV_VALUE_API_HOST,
    ENV_VALUE_RANDOM_STRING,
    ENV_VALUE_RANDOM_INT,
    ENV_VALUE_RANDOM_LONG,
} from "../../config/envKeys";
import { 
  TABLE_ENV_VAR_FIELDS,
} from '../../config/db';
import { getEnvValues, getKeys } from '../actions/env_value';
import { isStringEmpty } from '../util';

let env_var_pname = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_NAME;
let env_var_pvalue = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_VAR;

export default class {

    private env: string = ""; 

    private prj: string = "";

    private dispatch: any = null;

    private cb: (envKeyVar: Array<any>) => void = () => {};

    private env_vars: Array<any> = [];

    private envKeyVar: Map<string, string> = new Map();

    init(prj : string, env : string, dispatch : any, cb : (envKeyVar: Array<any>) => void) {  
        if (this.prj !== prj || this.env !== env) {
            this.env_vars = [];
            this.envKeyVar = new Map();
        }
        this.prj = prj;
        this.env = env;
        this.dispatch = dispatch;
        this.cb = cb;
    }

    getTips(cb: (result: Array<string>) => void) : void {
        if (this.env_vars.length === 0) {
            if (isStringEmpty(this.prj)) {
                return;
            }
            if (isStringEmpty(this.env)) {
                getKeys(this.prj).then(keys => {
                    cb(this.appendEnvKeys(keys))
                });
                return;
            }
            getEnvValues(this.prj, this.env, this.dispatch, env_vars => {
                this.env_vars = env_vars;
                cb(this.getTipsByEnvVars());
                this.cb(env_vars);
            });
        } else {
            cb(this.getTipsByEnvVars());
        }
    }

    async getHostAsync() : Promise<string> {
        if (this.env_vars.length === 0) {
            let env_vars = await getEnvValues(this.prj, this.env, this.dispatch, _ => {});
            this.env_vars = env_vars;
            return this.getApiHost();
        } else {
            return this.getApiHost();
        }
    }

    getHost(cb: (result: string) => void) : void { 
        if (this.env_vars.length === 0) {
            getEnvValues(this.prj, this.env, this.dispatch, env_vars => {
                this.env_vars = env_vars;
                cb(this.getApiHost());
            });
        } else {
            cb(this.getApiHost());
        }
    }

    getVarByKey(key : string) : string | undefined {
        if (key === ENV_VALUE_RANDOM_STRING) {
            return uuidv4() as string;
        }

        if (key === ENV_VALUE_RANDOM_INT) {
            return (Math.trunc(Math.random() * 2147483647)).toString();
        }

        if (key === ENV_VALUE_RANDOM_LONG) {
            return (Date.now()).toString();
        }

        return this.envKeyVar.get(key);
    }

    private getApiHost() : string {
        this.getTipsByEnvVars();
        return this.envKeyVar.get(ENV_VALUE_API_HOST) as string;
    }

    private getTipsByEnvVars() : Array<string> {
        let envKeys : Array<string> = [];
        for(let env_value of this.env_vars) {
            let tip_key = env_value[env_var_pname];
            envKeys.push(tip_key);
            this.envKeyVar.set(env_value[env_var_pname], env_value[env_var_pvalue]);
        }
        return this.appendEnvKeys(envKeys);
    }

    private appendEnvKeys(envKeys : Array<string>) : Array<string> {
        envKeys.push(ENV_VALUE_RANDOM_STRING);
        envKeys.push(ENV_VALUE_RANDOM_INT);
        envKeys.push(ENV_VALUE_RANDOM_LONG);
        return envKeys;
    }

}