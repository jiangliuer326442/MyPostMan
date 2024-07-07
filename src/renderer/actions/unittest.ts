import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

import { 
    TABLE_UNITTEST_NAME, TABLE_UNITTEST_FIELDS,
    TABLE_UNITTEST_STEPS_NAME,TABLE_UNITTEST_STEPS_FIELDS,
    TABLE_UNITTEST_EXECUTOR_NAME, TABLE_UNITTEST_EXECUTOR_FIELDS,
    TABLE_UNITTEST_EXECUTOR_REPORT_NAME, TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS,
    TABLE_UNITTEST_STEP_ASSERTS_NAME, TABLE_UNITTEST_STEP_ASSERT_FIELDS,
} from '../../config/db';

import {
    ChannelsReadFileStr,
    CONTENT_TYPE,
    CONTENT_TYPE_FORMDATA,
    REQUEST_METHOD_GET,
    REQUEST_METHOD_POST
} from '../../config/global_config';

import {
    UNITTEST_RESULT_SUCCESS,
    UNITTEST_RESULT_FAILURE,
    UNITTEST_RESULT_UNKNOWN
} from '../../config/unittest';

import { GET_ITERATOR_TESTS } from '../../config/redux';

import { getType, isStringEmpty, paramToString } from '../util';

import { isJsonString } from '../util/json';

import RequestSendTips from '../classes/RequestSendTips';
import JsonParamTips from '../classes/JsonParamTips';
import { cloneDeep } from 'lodash';

let unittest_iterator_uuid = TABLE_UNITTEST_FIELDS.FIELD_ITERATOR_UUID;
let field_unittest_uuid = TABLE_UNITTEST_FIELDS.FIELD_UUID;
let unittest_delFlg = TABLE_UNITTEST_FIELDS.FIELD_DELFLG;
let unittest_fold = TABLE_UNITTEST_FIELDS.FIELD_FOLD_NAME;
let unittest_title = TABLE_UNITTEST_FIELDS.FIELD_TITLE;
let unittest_cuid = TABLE_UNITTEST_FIELDS.FIELD_CUID;
let unittest_cuname = TABLE_UNITTEST_FIELDS.FIELD_CUNAME;
let unittest_ctime = TABLE_UNITTEST_FIELDS.FIELD_CTIME;

let field_unittest_step_uuid = TABLE_UNITTEST_STEPS_FIELDS.FIELD_UUID;
let unittest_step_iterator_uuid = TABLE_UNITTEST_STEPS_FIELDS.FIELD_ITERATOR_UUID;
let unittest_step_unittest_uuid = TABLE_UNITTEST_STEPS_FIELDS.FIELD_UNITTEST_UUID;
let unittest_step_title = TABLE_UNITTEST_STEPS_FIELDS.FIELD_TITLE;
let unittest_step_project = TABLE_UNITTEST_STEPS_FIELDS.FIELD_MICRO_SERVICE_LABEL;
let unittest_step_method = TABLE_UNITTEST_STEPS_FIELDS.FIELD_REQUEST_METHOD;
let unittest_step_uri = TABLE_UNITTEST_STEPS_FIELDS.FIELD_URI;
let unittest_step_header = TABLE_UNITTEST_STEPS_FIELDS.FIELD_REQUEST_HEADER;
let unittest_step_param = TABLE_UNITTEST_STEPS_FIELDS.FIELD_REQUEST_PARAM;
let unittest_step_body = TABLE_UNITTEST_STEPS_FIELDS.FIELD_REQUEST_BODY;
let unittest_step_continue = TABLE_UNITTEST_STEPS_FIELDS.FIELD_CONTINUE;
let unittest_step_sort = TABLE_UNITTEST_STEPS_FIELDS.FIELD_SORT;
let unittest_step_cuid = TABLE_UNITTEST_STEPS_FIELDS.FIELD_CUID;
let unittest_step_cuname = TABLE_UNITTEST_STEPS_FIELDS.FIELD_CUNAME;
let unittest_step_ctime = TABLE_UNITTEST_STEPS_FIELDS.FIELD_CTIME;
let unittest_step_delFlg = TABLE_UNITTEST_STEPS_FIELDS.FIELD_DELFLG;

let unittest_step_assert_iterator = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_ITERATOR_UUID;
let unittest_step_assert_unittest = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_UNITTEST_UUID;
let unittest_step_assert_step = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_STEP_UUID;
let unittest_step_assert_uuid = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_UUID;
let unittest_step_assert_title = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_TITLE;
let unittest_step_assert_left = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_ASSERT_LEFT;
let unittest_step_assert_operator = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_ASSERT_OPERATOR;
let unittest_step_assert_right = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_ASSERT_RIGHT;
let unittest_step_assert_cuid = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_CUID;
let unittest_step_assert_cuname = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_CUNAME;
let unittest_step_assert_delFlg = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_DELFLG;
let unittest_step_assert_ctime = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_CTIME;

let unittest_executor_batch = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_BATCH_UUID;
let unittest_executor_iterator = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_ITERATOR_UUID;
let unittest_executor_unittest = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_UNITTEST_UUID;
let unittest_executor_step = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_STEPS_UUID;
let unittest_executor_header = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_REQUEST_HEADER;
let unittest_executor_param = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_REQUEST_PARAM;
let unittest_executor_body = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_REQUEST_BODY;
let unittest_executor_response = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_REQUEST_RESPONSE;
let unittest_executor_delFlg = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_DELFLG;
let unittest_executor_ctime = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_CTIME;
let unittest_executor_assert_left = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_ASSERT_LEFT;
let unittest_executor_assert_right = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_ASSERT_RIGHT;
let unittest_executor_result = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_RESULT;
let unittest_executor_cost_time = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_COST_TIME;

let unittest_report_iterator = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_ITERATOR_UUID;
let unittest_report_env = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_ENV;
let unittest_report_unittest = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_UNITTEST_UUID;
let unittest_report_batch = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_BATCH_UUID;
let unittest_report_delFlg = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_DELFLG;
let unittest_report_ctime = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_CTIME;
let unittest_report_result = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_RESULT;
let unittest_report_step = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_STEP;
let unittest_report_cost_time = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_COST_TIME;
let unittest_report_failure_reason = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_REASON;

export async function addUnitTest(versionIteratorId : string, title : string, folder : string, device : object, cb) {
    await window.db.open();

    let unit_test : any = {};
    unit_test[unittest_iterator_uuid] = versionIteratorId;
    unit_test[field_unittest_uuid] = uuidv4() as string;
    unit_test[unittest_title] = title;
    unit_test[unittest_fold] = folder;
    unit_test[unittest_cuid] = device.uuid;
    unit_test[unittest_cuname] = device.uname;
    unit_test[unittest_ctime] = Date.now();
    unit_test[unittest_delFlg] = 0;
    await window.db[TABLE_UNITTEST_NAME].put(unit_test);

    cb();
}

export async function addUnitTestStep(
    versionIteratorId : string, unitTestUuid : string, 
    title : string, project : string, method: string, uri : string,
    header: object, param: object, body: object,
    assertTitleArr: Array<string>, assertPrevArr: Array<string>, assertOperatorArr: Array<string>, assertAfterArr: Array<string>,
    sort: number, continueEnable: string,
    device : object, cb) {
        window.db.transaction('rw',
            window.db[TABLE_UNITTEST_STEPS_NAME],
            window.db[TABLE_UNITTEST_STEP_ASSERTS_NAME], 
            async () => {

                let stepId = uuidv4() as string;

                let unit_test_step : any = {};
                unit_test_step[field_unittest_step_uuid] = stepId;
                unit_test_step[unittest_step_iterator_uuid] = versionIteratorId;
                unit_test_step[unittest_step_unittest_uuid] = unitTestUuid;
                unit_test_step[unittest_step_title] = title;
                unit_test_step[unittest_step_project] = project;
                unit_test_step[unittest_step_method] = method;
                unit_test_step[unittest_step_uri] = uri;
                unit_test_step[unittest_step_header] = header;
                unit_test_step[unittest_step_param] = param;
                unit_test_step[unittest_step_body] = body;
                unit_test_step[unittest_step_continue] = continueEnable;
                unit_test_step[unittest_step_sort] = sort;
                unit_test_step[unittest_step_cuid] = device.uuid;
                unit_test_step[unittest_step_cuname] = device.uname;
                unit_test_step[unittest_step_ctime] = Date.now();
                unit_test_step[unittest_step_delFlg] = 0;
                await window.db[TABLE_UNITTEST_STEPS_NAME].put(unit_test_step);

                let unit_test_step_assert : Array<any> = [];

                for(let i in assertTitleArr) {
                    let assertTitle = assertTitleArr[i];
                    let assertPrev = assertPrevArr[i];
                    let assertOperator = assertOperatorArr[i];
                    let assertAfter = assertAfterArr[i];
                    let unit_test_step_assert_item : any = {};
                    unit_test_step_assert_item[unittest_step_assert_iterator] = versionIteratorId;
                    unit_test_step_assert_item[unittest_step_assert_unittest] = unitTestUuid;
                    unit_test_step_assert_item[unittest_step_assert_step] = stepId;
                    unit_test_step_assert_item[unittest_step_assert_uuid] = uuidv4() as string;
                    unit_test_step_assert_item[unittest_step_assert_title] = assertTitle;
                    unit_test_step_assert_item[unittest_step_assert_left] = assertPrev;
                    unit_test_step_assert_item[unittest_step_assert_operator] = assertOperator;
                    unit_test_step_assert_item[unittest_step_assert_right] = assertAfter;
                    unit_test_step_assert_item[unittest_step_assert_cuid] = device.uuid;
                    unit_test_step_assert_item[unittest_step_assert_cuname] = device.uname;
                    unit_test_step_assert_item[unittest_step_assert_delFlg] = 0;
                    unit_test_step_assert_item[unittest_step_assert_ctime] = Date.now();

                    unit_test_step_assert.push(unit_test_step_assert_item);
                }
                await window.db[TABLE_UNITTEST_STEP_ASSERTS_NAME].bulkPut(unit_test_step_assert);
                cb();
            }
        );
}

export async function editUnitTest(uuid : string, title : string, folder : string, cb) {
    await window.db.open();

    let unitTest = await window.db[TABLE_UNITTEST_NAME]
    .where(field_unittest_uuid).equals(uuid)
    .first();

    if (unitTest !== undefined) {
        unitTest[unittest_title] = title;
        unitTest[unittest_fold] = folder;
        await window.db[TABLE_UNITTEST_NAME].put(unitTest);
    
        cb();
    }
}

export async function editUnitTestStep(
    unittest_step_uuid : string, title : string,
    header: object, param: object, body: object,
    assertTitleArr: Array<string>, assertPrevArr: Array<string>, assertOperatorArr: Array<string>, assertAfterArr: Array<string>, 
    assertUuidArr: Array<string>, sort: number, continueEnable: string, device: any, cb) {
    await window.db.open();

    let unit_test_step = await window.db[TABLE_UNITTEST_STEPS_NAME]
    .where(field_unittest_step_uuid).equals(unittest_step_uuid)
    .first();

    if (unit_test_step !== undefined) {
        unit_test_step[unittest_step_title] = title;
        unit_test_step[unittest_step_header] = header;
        unit_test_step[unittest_step_param] = param;
        unit_test_step[unittest_step_body] = body;
        unit_test_step[unittest_step_sort] = sort;
        unit_test_step[unittest_step_continue] = continueEnable;
        await window.db[TABLE_UNITTEST_STEPS_NAME].put(unit_test_step);
    }

    let unit_test_step_assert : Array<any> = [];

    for (let _index in assertTitleArr) {
        let operate;
        let assertUuid;
        if (isStringEmpty(assertUuidArr[_index])) {
            operate = "add";
            assertUuid = uuidv4() as string;
        } else {
            operate = "edit";
            assertUuid = assertUuidArr[_index];
        }
        let assertTitle = assertTitleArr[_index];
        let assertPrev = assertPrevArr[_index];
        let assertOperator = assertOperatorArr[_index];
        let assertAfter = assertAfterArr[_index];
        let unit_test_step_assert_item : any;
        
        if (operate === "edit") {
            unit_test_step_assert_item = await window.db[TABLE_UNITTEST_STEP_ASSERTS_NAME]
            .where(unittest_step_assert_uuid).equals(assertUuid)
            .first();
    
            if (unit_test_step_assert_item !== undefined) {
                unit_test_step_assert_item[unittest_step_assert_title] = assertTitle;
                unit_test_step_assert_item[unittest_step_assert_left] = assertPrev;
                unit_test_step_assert_item[unittest_step_assert_operator] = assertOperator;
                unit_test_step_assert_item[unittest_step_assert_right] = assertAfter;
                unit_test_step_assert.push(unit_test_step_assert_item);
            }
        } else if (operate === "add") {
            unit_test_step_assert_item = {};
            unit_test_step_assert_item[unittest_step_assert_iterator] = unit_test_step[unittest_step_iterator_uuid];
            unit_test_step_assert_item[unittest_step_assert_unittest] = unit_test_step[unittest_step_unittest_uuid];
            unit_test_step_assert_item[unittest_step_assert_step] = unittest_step_uuid;
            unit_test_step_assert_item[unittest_step_assert_uuid] = assertUuid;
            unit_test_step_assert_item[unittest_step_assert_title] = assertTitle;
            unit_test_step_assert_item[unittest_step_assert_left] = assertPrev;
            unit_test_step_assert_item[unittest_step_assert_operator] = assertOperator;
            unit_test_step_assert_item[unittest_step_assert_right] = assertAfter;
            unit_test_step_assert_item[unittest_step_assert_cuid] = device.uuid;
            unit_test_step_assert_item[unittest_step_assert_cuname] = device.uname;
            unit_test_step_assert_item[unittest_step_assert_delFlg] = 0;
            unit_test_step_assert_item[unittest_step_assert_ctime] = Date.now();
            unit_test_step_assert.push(unit_test_step_assert_item);
        }
    }
    await window.db[TABLE_UNITTEST_STEP_ASSERTS_NAME].bulkPut(unit_test_step_assert);
    cb();
}

export async function delUnitTest(row, cb) {
    await window.db.open();

    let uuid = row[field_unittest_uuid];

    let unitTest = await window.db[TABLE_UNITTEST_NAME]
    .where(field_unittest_uuid).equals(uuid)
    .first();

    if (unitTest !== undefined) {
        unitTest[field_unittest_uuid] = uuid;
        unitTest[unittest_delFlg] = 1;
        await window.db[TABLE_UNITTEST_NAME].put(unitTest);
        cb();
    }
}

export async function delUnitTestStep(unittestStepUuid : string, cb) {
    await window.db.open();

    let unitTestStep = await window.db[TABLE_UNITTEST_STEPS_NAME]
    .where(field_unittest_step_uuid).equals(unittestStepUuid)
    .first();

    if (unitTestStep !== undefined) {
        unitTestStep[unittest_step_delFlg] = 1;
        await window.db[TABLE_UNITTEST_STEPS_NAME].put(unitTestStep);
        cb();
    }
}

export async function getUnitTests(iteratorId : string, env : string|null, dispatch) {
    await window.db.open();

    //单测列表
    let unitTests = await window.db[TABLE_UNITTEST_NAME]
    .where([unittest_delFlg, unittest_iterator_uuid])
    .equals([0, iteratorId])
    .reverse()
    .toArray();

    for (let unitTest of unitTests) {
        let unittest_uuid = unitTest[field_unittest_uuid];
        let batch_uuid = "";
        //拿整体执行报告
        let unittestReport;
        if (env !== null) {
            unittestReport = await window.db[TABLE_UNITTEST_EXECUTOR_REPORT_NAME]
            .where([unittest_report_delFlg, unittest_report_iterator, unittest_report_unittest, unittest_report_env])
            .equals([0, iteratorId, unittest_uuid, env])
            .reverse()
            .first();
        } else {
            unittestReport = await window.db[TABLE_UNITTEST_EXECUTOR_REPORT_NAME]
            .where([unittest_report_delFlg, unittest_report_iterator, unittest_report_unittest])
            .equals([0, iteratorId, unittest_uuid])
            .reverse()
            .first();
        }
        if (unittestReport !== undefined) {
            env = unittestReport[unittest_report_env];
            batch_uuid = unittestReport[unittest_report_batch];
            unitTest[unittest_report_batch] = batch_uuid; //批次 id
            unitTest[unittest_report_step] = unittestReport[unittest_report_step]; //执行 浮标
            unitTest[unittest_report_result] = unittestReport[unittest_report_result];
            unitTest[unittest_report_env] = env;
            unitTest[unittest_report_cost_time] = unittestReport[unittest_report_cost_time];
        }

        let unitTestSteps = await window.db[TABLE_UNITTEST_STEPS_NAME]
        .where([unittest_step_delFlg, unittest_step_iterator_uuid, unittest_step_unittest_uuid])
        .equals([0, iteratorId, unittest_uuid])
        .toArray();

        if (!isStringEmpty(unitTest[unittest_report_step])) {
            if (unitTest[unittest_report_result] === UNITTEST_RESULT_UNKNOWN) {
                let markFlg = -1;
                for (let unitTestStep of unitTestSteps) {
                    let stepUuid = unitTestStep[field_unittest_step_uuid];
                    //还没打标，遇到数值一样的步骤，开始打标
                    if (markFlg === -1 && stepUuid === unitTest[unittest_report_step]) {
                        markFlg = 0;
                        continue;
                    }
                    //打标
                    if (markFlg === 0) {
                        unitTest[unittest_report_step] = stepUuid;
                        markFlg = 1;
                        continue;
                    }
                    //已经打过标
                    if (markFlg === 1) {
                        break;
                    }
                }
            } else {
                unitTest[unittest_report_step] = "";
            }
        }

        if (!isStringEmpty(batch_uuid)) {
            for (let unitTestStep of unitTestSteps) {
                //当前执行步骤
                unitTestStep[unittest_report_step] = unitTest[unittest_report_step];
                //当前执行批次
                unitTestStep[unittest_report_batch] = batch_uuid;
                //当前环境
                unitTestStep[unittest_report_env] = env;
                let stepUuid = unitTestStep[field_unittest_step_uuid];
                let unittest_executor_report = await window.db[TABLE_UNITTEST_EXECUTOR_NAME]
                .where([unittest_executor_iterator, unittest_executor_unittest, unittest_executor_batch, unittest_executor_step])
                .equals([iteratorId, unittest_uuid, batch_uuid, stepUuid])
                .first();
                if (unittest_executor_report !== undefined) {
                    unitTestStep[unittest_executor_result] = unittest_executor_report[unittest_executor_result];
                    unitTestStep[unittest_executor_cost_time] = unittest_executor_report[unittest_executor_cost_time];
                }
            }
        }

        unitTest['children'] = unitTestSteps;
    }

    dispatch({
        type: GET_ITERATOR_TESTS,
        iteratorId,
        unitTests
    });
}

export async function getUnitTestStepAsserts(iteratorId : string, unitTestId : string, stepId : string) {
    await window.db.open();

    let unitTestAsserts = await window.db[TABLE_UNITTEST_STEP_ASSERTS_NAME]
    .where([unittest_step_assert_delFlg, unittest_step_assert_iterator, unittest_step_assert_unittest, unittest_step_assert_step])
    .equals([0, iteratorId, unitTestId, stepId])
    .reverse()
    .toArray();

    return unitTestAsserts;
}

export async function continueExecuteUnitTest(
    iteratorId : string, unitTestId : string, batchId : string, stepId : string,
    env : string, dispatch : any) {

    let allSteps = await window.db[TABLE_UNITTEST_STEPS_NAME]
    .where([unittest_step_delFlg, unittest_step_iterator_uuid, unittest_step_unittest_uuid])
    .equals([0, iteratorId, unitTestId])
    .toArray();

    let executeFlg = false;
    let steps = [];
    for (let _unit_test_step of allSteps) {  
        let stepUuid = _unit_test_step[field_unittest_step_uuid];
        if (stepUuid === stepId) {
            executeFlg = true;
        }
        if (!executeFlg) {
            continue;
        }
        steps.push(_unit_test_step);
    }
    let ret = await stepsExecutor(steps, iteratorId, unitTestId, batchId, env, dispatch);
    let success = ret.success;
    let recentStepUuid = ret.recentStepUuid;
    let errorMessage = ret.errorMessage;
    let btime = ret.btime;
    let unitTestReport = await window.db[TABLE_UNITTEST_EXECUTOR_REPORT_NAME]
    .where([unittest_report_iterator, unittest_report_unittest, unittest_report_batch])
    .equals([iteratorId, unitTestId, batchId])
    .first();
    unitTestReport[unittest_report_result] = success;
    unitTestReport[unittest_report_step] = recentStepUuid;
    unitTestReport[unittest_report_failure_reason] = errorMessage;
    unitTestReport[unittest_report_cost_time] = Date.now() - btime;
    await window.db[TABLE_UNITTEST_EXECUTOR_REPORT_NAME].put(unitTestReport);
    return batchId;
}


export async function executeUnitTest(
    iteratorId : string, unitTestId : string, 
    steps : Array<any>, env : string, dispatch : any) : Promise<string>
    {
    let batch_uuid = uuidv4() as string;

    let ret = await stepsExecutor(steps, iteratorId, unitTestId, batch_uuid, env, dispatch);
    let success = ret.success;
    let recentStepUuid = ret.recentStepUuid;
    let errorMessage = ret.errorMessage;
    let btime = ret.btime;

    let unittest_result : any = {};
    unittest_result[unittest_report_iterator] = iteratorId;
    unittest_result[unittest_report_env] = env;
    unittest_result[unittest_report_unittest] = unitTestId;
    unittest_result[unittest_report_batch] = batch_uuid;
    unittest_result[unittest_report_delFlg] = 0;
    unittest_result[unittest_report_ctime] = Date.now();
    unittest_result[unittest_report_result] = success;
    unittest_result[unittest_report_step] = recentStepUuid;
    unittest_result[unittest_report_failure_reason] = errorMessage;
    unittest_result[unittest_report_cost_time] = Date.now() - btime;

    await window.db[TABLE_UNITTEST_EXECUTOR_REPORT_NAME].put(unittest_result);

    return batch_uuid;
}

async function stepsExecutor(steps : Array<any>, iteratorId : string, unitTestId : string, batch_uuid : string, env : string, dispatch : any) : Promise<any> {
    let btime = Date.now();
    let success = UNITTEST_RESULT_SUCCESS;
    let errorMessage = "";
    let firstStepUuid = steps.at(0)[field_unittest_step_uuid];
    let recentStepUuid = "";
    for (let _unit_test_step of steps) {  
        let unit_test_step = cloneDeep(_unit_test_step);
        let stepUuid = unit_test_step[field_unittest_step_uuid];
        let project = unit_test_step[unittest_step_project];
        let requestUri = unit_test_step[unittest_step_uri];
        let header = unit_test_step[unittest_step_header];
        let param = unit_test_step[unittest_step_param];
        let body = unit_test_step[unittest_step_body];
        let isContinue = unit_test_step[unittest_step_continue];
        //不继续了，且不是最后一步，结果就是未知的，并且记录下最后执行的步骤 uuid，以便于继续执行
        if (!(isContinue == 1) && stepUuid !== firstStepUuid) {
            success = UNITTEST_RESULT_UNKNOWN;
            break;
        }
        recentStepUuid = stepUuid;

        let promises : any = {};
        let method = unit_test_step[unittest_step_method];
        let unitTestAsserts = await getUnitTestStepAsserts(iteratorId, unitTestId, stepUuid);
        let envVarTips = new RequestSendTips();
        envVarTips.init(project, env, dispatch, env_vars => {});
        let requestHost = await envVarTips.getHostAsync();
        let url = requestHost + requestUri;

        let contentType = "";

        if (Object.keys(header).length > 0) {
            for (let _key in header) {
                if (_key === CONTENT_TYPE) {
                    contentType = header[_key];
                }
                let jsonParamTips = new JsonParamTips(project, header[_key], dispatch);
                jsonParamTips.setEnv(env);
                header[_key] = await jsonParamTips.getValue(envVarTips, param, header, body, {}, iteratorId, unitTestId, batch_uuid);
            }
        }
        if (Object.keys(body).length > 0) {
            for (let _key in body) {
                if (contentType === CONTENT_TYPE_FORMDATA) {
                    //文件类型取 blob 格式的数据
                    if (getType(body[_key]) === "Object") {
                        let path = body[_key].path;
                        promises[_key] = {};
                        promises[_key].promise = new Promise((resolve, reject) => {
                            promises[_key].listener = window.electron.ipcRenderer.on(ChannelsReadFileStr, (key, path, blob) => {
                                if (key === _key) {
                                    let _file = body[_key];
                                    _file.blob = blob.buffer;
                                    resolve({key: _key, file: _file});
                                }
                            });
                            window.electron.ipcRenderer.sendMessage(ChannelsReadFileStr, _key, path);
                        });
                    } else {
                        let jsonParamTips = new JsonParamTips(project, body[_key], dispatch);
                        jsonParamTips.setEnv(env);
                        body[_key] = await jsonParamTips.getValue(envVarTips, param, header, body, {}, iteratorId, unitTestId, batch_uuid);
                    }
                } else {
                    let jsonParamTips = new JsonParamTips(project, body[_key], dispatch);
                    jsonParamTips.setEnv(env);
                    body[_key] = await jsonParamTips.getValue(envVarTips, param, header, body, {}, iteratorId, unitTestId, batch_uuid);
                }

            }
        }
        if (Object.keys(param).length > 0) {
            for (let _key in param) {
                let jsonParamTips = new JsonParamTips(project, param[_key], dispatch);
                jsonParamTips.setEnv(env);
                param[_key] = await jsonParamTips.getValue(envVarTips, param, header, body, {}, iteratorId, unitTestId, batch_uuid);
            }
        }

        if (!isStringEmpty(paramToString(param))) {
            url += "?" + paramToString(param);
        }

        let response = null;

        let executorBtime = Date.now();

        if (method === REQUEST_METHOD_POST) {
            if (contentType === CONTENT_TYPE_FORMDATA) {
                let formData = new FormData();
                //有文件上传，需要等待文件上传完成再操作
                if (Object.keys(promises).length > 0) {
                    let promiseArr = [];
                    for (let _key in promises) {
                        promiseArr.push(promises[_key].promise);
                    }
                    //资源上传全部处理完成
                    let values = await Promise.all(promiseArr);

                    for (let _value of values) {
                        let _key = _value.key;
                        //移除监听器
                        promises[_key].listener();
                        //移除 body
                        delete body[_key];
                        let _file = _value.file;
                        const blobFile = new Blob([_file.blob], { type: _file.type });  
                        formData.append(_key, blobFile, _file.name);
                    }
                }
                for (let _key in body) {
                    formData.append(_key, body[_key]);
                }
                try {
                    response = await axios.post(url, formData, {
                        headers: header
                    });
                } catch (error) {
                    errorMessage = error.message;
                }
            } else {
                try {
                    response = await axios.post(url, body, {
                      headers: header
                    });
                } catch (error) {
                    errorMessage = error.message;
                }
            }
        } else if (method === REQUEST_METHOD_GET) {
            try {
                response = await axios.get(url, {
                    headers: header
                });
            } catch (error) {
                errorMessage = error.message;
            }
        }
        let executorEtime = Date.now();

        let breakFlg = true;
        let responseData = {};
        let assertLeftValue : any[] = [];
        let assertRightValue : any[] = [];

        if (response !== null && isStringEmpty(errorMessage)) {
            if (isJsonString(JSON.stringify(response.data)) || (response.headers['content-type'] && response.headers['content-type'].toString().indexOf("application/json") >= 0)) {
                responseData = response.data;

                for (let _key in unitTestAsserts) {
                    let keyNumber = Number(_key) as number;
                    let unitTestAssert = unitTestAsserts[keyNumber];

                    let assertLeft = unitTestAssert[unittest_step_assert_left];
                    let assertRight = unitTestAssert[unittest_step_assert_right];
                    let assertOperator = unitTestAssert[unittest_step_assert_operator];
    
                    let leftJsonParamTips = new JsonParamTips(project, assertLeft, dispatch);
                    leftJsonParamTips.setEnv(env);
                    assertLeftValue[keyNumber] = await leftJsonParamTips.getValue(envVarTips, param, header, body, response.data, iteratorId, unitTestId, batch_uuid);
    
                    let rightJsonParamTips = new JsonParamTips(project, assertRight, dispatch);
                    rightJsonParamTips.setEnv(env);
                    assertRightValue[keyNumber] = await rightJsonParamTips.getValue(envVarTips, param, header, body, response.data, iteratorId, unitTestId, batch_uuid);

                    if (typeof assertLeftValue[keyNumber] === "number") {
                        assertLeftValue[keyNumber] = assertLeftValue[keyNumber].toString();
                    }

                    if (typeof assertRightValue[keyNumber] === "number") {
                        assertRightValue[keyNumber] = assertRightValue[keyNumber].toString();
                    }

                    if (assertOperator === " == ") {
                        if (assertLeftValue[keyNumber] === assertRightValue[keyNumber]) {
                            breakFlg = false;
                        } else {
                            breakFlg = true;
                            break;
                        }
                    } else {
                        if (assertLeftValue[keyNumber] !== assertRightValue[keyNumber]) {
                            breakFlg = false;
                        } else {
                            breakFlg = true;
                            break;
                        }
                    }
                }
            }
        }

        let unit_test_executor : any = {};
        unit_test_executor[unittest_executor_batch] = batch_uuid;
        unit_test_executor[unittest_executor_iterator] = iteratorId;
        unit_test_executor[unittest_executor_unittest] = unitTestId;
        unit_test_executor[unittest_executor_step] = stepUuid;
        unit_test_executor[unittest_executor_header] = header;
        unit_test_executor[unittest_executor_param] = param;
        unit_test_executor[unittest_executor_body] = body;
        unit_test_executor[unittest_executor_response] = responseData;
        unit_test_executor[unittest_executor_assert_left] = assertLeftValue;
        unit_test_executor[unittest_executor_assert_right] = assertRightValue;
        unit_test_executor[unittest_executor_result] = !breakFlg;
        unit_test_executor[unittest_executor_cost_time] = executorEtime - executorBtime;
        unit_test_executor[unittest_executor_delFlg] = 0;
        unit_test_executor[unittest_executor_ctime] = Date.now();
        await window.db[TABLE_UNITTEST_EXECUTOR_NAME].put(unit_test_executor);

        //遇到错误结束
        if (breakFlg) {
            success = UNITTEST_RESULT_FAILURE;
            break;
        }
    }

    return {
        success,
        recentStepUuid,
        errorMessage,
        etime: Date.now(),
        btime,
    };
}


export async function getExecutorReports(iteratorId : string, unittest_uuid : string, env : string) {
    await window.db.open();

    let unittestReports = await window.db[TABLE_UNITTEST_EXECUTOR_REPORT_NAME]
    .where([unittest_report_delFlg, unittest_report_iterator, unittest_report_unittest, unittest_report_env])
    .equals([0, iteratorId, unittest_uuid, env])
    .reverse()
    .toArray();

    return unittestReports;
}

export async function getSingleExecutorReport(iteratorId : string, unittestId : string, batchId : string) {
    await window.db.open();

    let unitTestReport = await window.db[TABLE_UNITTEST_EXECUTOR_REPORT_NAME]
    .where([unittest_report_iterator, unittest_report_unittest, unittest_report_batch])
    .equals([iteratorId, unittestId, batchId])
    .first();

    return unitTestReport;
}

export async function getSingleExecutorStep(iteratorId : string, unittestId : string, batchId : string, stepId : string) : Promise<any> {
    await window.db.open();

    let unitTestStep = await window.db[TABLE_UNITTEST_EXECUTOR_NAME]
    .where([unittest_executor_iterator, unittest_executor_unittest, unittest_executor_batch, unittest_executor_step])
    .equals([iteratorId, unittestId, batchId, stepId])
    .first();

    return unitTestStep;
}

export async function getRecentExecutorReport(iteratorId : string) {
    await window.db.open();

    let unitTestReport = await window.db[TABLE_UNITTEST_EXECUTOR_REPORT_NAME]
    .where([unittest_report_delFlg, unittest_report_iterator])
    .equals([0, iteratorId])
    .reverse()
    .first();

    return unitTestReport;
}