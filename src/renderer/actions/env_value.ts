import { 
    TABLE_ENV_KEY_NAME, TABLE_ENV_KEY_FIELDS,
    TABLE_ENV_VAR_NAME, TABLE_ENV_VAR_FIELDS,
} from '../../config/db';
import { GET_ENV_VALS } from '../../config/redux';

let env_key_delFlg = TABLE_ENV_KEY_FIELDS.FIELD_DELFLG;
let env_key_prj = TABLE_ENV_KEY_FIELDS.FIELD_MICRO_SERVICE_LABEL;
let env_key_pname = TABLE_ENV_KEY_FIELDS.FIELD_PARAM_NAME;
let env_key_cuid = TABLE_ENV_KEY_FIELDS.FIELD_CUID;
let env_key_cuname = TABLE_ENV_KEY_FIELDS.FIELD_CUNAME;
let env_key_ctime = TABLE_ENV_KEY_FIELDS.FIELD_CTIME;

let env_var_env = TABLE_ENV_VAR_FIELDS.FIELD_ENV_LABEL;
let env_var_micro_service = TABLE_ENV_VAR_FIELDS.FIELD_MICRO_SERVICE_LABEL;
let env_var_pname = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_NAME;
let env_var_pvalue = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_VAR;
let env_var_delFlg = TABLE_ENV_VAR_FIELDS.FIELD_DELFLG;
let env_var_cuid = TABLE_ENV_VAR_FIELDS.FIELD_CUID;
let env_var_cuname = TABLE_ENV_VAR_FIELDS.FIELD_CUNAME;
let env_var_ctime = TABLE_ENV_VAR_FIELDS.FIELD_CTIME;

export async function getVarsByKey(prj, pname) {
    await window.db.open();

    const envVarItems = await db[TABLE_ENV_VAR_NAME]
    .where('[' + env_var_micro_service + '+' + env_var_pname + ']')
    .equals([prj, pname]).toArray();
    return envVarItems;
}

export async function getKeys(prj) {
    await window.db.open();

    let envKeys = await window.db[TABLE_ENV_KEY_NAME]
    .where('[' + env_key_delFlg + '+' + env_key_prj + ']')
    .equals([0, prj])
    .reverse()
    .toArray();

    let keyArr = envKeys.map(envKey => envKey[env_key_pname]);
    return keyArr;
}

export async function getEnvValues(prj, env, dispatch, cb) : Promise<Array<any>> {
    await window.db.open();

    const env_vars = []; 
    let envKeys = await window.db[TABLE_ENV_KEY_NAME]
    .where('[' + env_key_delFlg + '+' + env_key_prj + ']')
    .equals([0, prj])
    .reverse()
    .toArray();
    for (const envKey of envKeys) {  
        let pname = envKey[env_key_pname];
        const envVarItem = await db[TABLE_ENV_VAR_NAME]
        .where('[' + env_var_env + '+' + env_var_micro_service + '+' + env_var_pname + ']')
        .equals([env, prj, pname]).first();  
        if (envVarItem !== undefined && envVarItem[env_var_delFlg] === 0) {
            env_vars.push(envVarItem);
        }
    }
    
    cb(env_vars);

    dispatch({
        type: GET_ENV_VALS,
        prj,
        env,
        env_vars,
    });

    return env_vars;
}

export async function delEnvValue(prj, env, row, cb) {
    window.db.transaction('rw',
        window.db[TABLE_ENV_KEY_NAME],
        window.db[TABLE_ENV_VAR_NAME], 
        async () => {
            let pname = row[env_var_pname];

            const envVarItem = await window.db[TABLE_ENV_VAR_NAME]
            .where('[' + env_var_env + '+' + env_var_micro_service + '+' + env_var_pname + ']')
            .equals([env, prj, pname]).first();  
            if (envVarItem !== undefined) {
                envVarItem[env_var_env] = env;
                envVarItem[env_var_micro_service] = prj;
                envVarItem[env_var_pname] = pname;
                envVarItem[env_var_delFlg] = 1;
                await window.db[TABLE_ENV_VAR_NAME].put(envVarItem);
            }

            const envVars = await window.db[TABLE_ENV_VAR_NAME]
            .where('[' + env_var_micro_service + '+' + env_var_pname + ']')
            .equals([prj, pname]).toArray();  
            let delEnvKeyFlag = true;
            for (const envVarItem of envVars) {  
                if (envVarItem[env_var_delFlg] === 0) {
                    delEnvKeyFlag = false;
                }
            }
            if (delEnvKeyFlag) {
                let env_key = await window.db[TABLE_ENV_KEY_NAME]
                .where('[' + env_key_prj + '+' + env_key_pname + ']')
                .equals([prj, pname])
                .first();
                env_key[env_key_prj] = prj;
                env_key[env_key_pname] = pname;
                env_key[env_key_delFlg] = 1;
                console.debug(env_key);
                await window.db[TABLE_ENV_KEY_NAME].put(env_key);
            }
            cb();
    });
}

export async function addEnvValues(prj, env, pname, pval, device, cb) {
    window.db.transaction('rw',
    window.db[TABLE_ENV_KEY_NAME],
    window.db[TABLE_ENV_VAR_NAME], async () => {
        let env_key = {};
        env_key[env_key_prj] = prj;
        env_key[env_key_pname] = pname;
        env_key[env_key_cuid] = device.uuid;
        env_key[env_key_cuname] = device.uname;
        env_key[env_key_ctime] = Date.now();
        env_key[env_key_delFlg] = 0;
        await window.db[TABLE_ENV_KEY_NAME].put(env_key);

        let property_key = {};
        property_key[env_var_micro_service] = prj;
        property_key[env_var_env] = env;
        property_key[env_var_pname] = pname;
        property_key[env_var_pvalue] = pval;
        property_key[env_var_cuid] = device.uuid;
        property_key[env_var_cuname] = device.uname;
        property_key[env_var_ctime] = Date.now();
        property_key[env_var_delFlg] = 0;
        await window.db[TABLE_ENV_VAR_NAME].put(property_key);
        cb();
    })
}