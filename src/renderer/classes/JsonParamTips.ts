import { cloneDeep } from 'lodash';

import RequestSendTips from '../classes/RequestSendTips';
import { isStringEmpty } from "../util";
import { TABLE_FIELD_TYPE, TABLE_FIELD_REMARK, TABLE_FIELD_VALUE } from '../util/json';
import { 
    UNITTEST_FUNCTION_ARRAY_FIRST,
    UNITTEST_STEP_CURRENT,
    UNITTEST_STEP_RESPONSE,
    UNITTEST_STEP_PROJECT_CURRENT,
    UNITTEST_STEP_POINTED,
    UNITTEST_DATASOURCE_TYPE_ENV,
    UNITTEST_DATASOURCE_TYPE_REF,
    UNITTEST_STEP_PROJECT_POINTED,
    UNITTEST_FUNCTION_ARRAY_RANDOM,
    UNITTEST_STEP_BODY,
    UNITTEST_STEP_PARAM,
    UNITTEST_STEP_HEADER,
} from '../../config/unittest';

import { 
    TABLE_UNITTEST_EXECUTOR_NAME, TABLE_UNITTEST_EXECUTOR_FIELDS,
} from '../../config/db';

let field_unittest_executor_batch = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_BATCH_UUID;
let field_unittest_executor_iterator = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_ITERATOR_UUID;
let field_unittest_executor_unittest = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_UNITTEST_UUID;
let field_unittest_executor_step = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_STEPS_UUID;
let field_unittest_executor_delFlg = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_DELFLG;
let field_unittest_executor_header = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_REQUEST_HEADER;
let field_unittest_executor_param = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_REQUEST_PARAM;
let field_unittest_executor_body = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_REQUEST_BODY;
let field_unittest_executor_response = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_REQUEST_RESPONSE;

export default class {

    private project: string;

    private dataSourceJson: Object = {};

    private envVarTips : RequestSendTips;

    private env : string = "";

    //当前项目
    private currentProject : string;

    //数据源类型 引用步骤参数 或者 环境变量 & 固定值
    private dataSourceType : string | null = null;
    //选择框 选中的步骤
    private selectedStep = UNITTEST_STEP_CURRENT;
    //选择框 步骤数据源来源
    private selectedDataSource : string = UNITTEST_STEP_RESPONSE;
    //选择框 选中的项目
    private selectedProject = UNITTEST_STEP_PROJECT_CURRENT;
    //最终填写的表达式
    private assertPrev : string | null = null;

    private dispatch : any;

    constructor(project: string, content : string, dispatch : any) {
        this.project = project;
        this.currentProject = project;
        this.dispatch = dispatch;
        this.parseFromStandardExpression(content);

        this.envVarTips = new RequestSendTips();
        this.envVarTips.init(this.currentProject, this.env, this.dispatch, env_vars => {});
    }

    setEnv(env: string) {
        this.env = env;
    }

    getDataSourceType() : string | null {
        return this.dataSourceType;
    }

    getSelectedStep() : string {
        return this.selectedStep;
    }

    getSelectedDataSource() : string {
        return this.selectedDataSource;
    }

    setSelectedProject(selectedProject : string) {
        this.selectedProject = selectedProject;
        if (this.selectedProject !== UNITTEST_STEP_PROJECT_CURRENT) {
            this.currentProject = this.selectedProject.substring(UNITTEST_STEP_PROJECT_POINTED.length);
        }
        this.envVarTips.init(this.currentProject, "", this.dispatch, env_vars => {});
    }

    getSelectedProject() : string {
        return this.selectedProject;
    }

    getAssertPrev() : string | null {
        return this.assertPrev;
    }

    setDataSourceJson(dataSourceJson : Object) { 
        this.dataSourceJson = dataSourceJson;
    }

    getTips(text : string, cb: (result: Array<any>) => void) : void {
        let result : Array<any> = [];
        if (isStringEmpty(text)) {
            cb(result);
        }

        if (text.indexOf("{{") === 0) {
            this.envVarTips.getTips(envKeys => {
                let searchContent = text.substring(2);
                let responseTips : Array<any> = [];
                for (let envKey of envKeys) {
                    if (!isStringEmpty(searchContent) && envKey.toLowerCase().indexOf(searchContent.toLowerCase()) < 0) {
                        continue;
                    }
                    let responseTipItem : any = {};
                    responseTipItem.value = "{{" + envKey + "}}";
                    responseTipItem.label = envKey;
                    responseTips.push(responseTipItem);
                }
                cb(responseTips);
            });
            return;
        }

        let jsonObject : any = cloneDeep(this.dataSourceJson);
        let textArr;
        if(text.indexOf(".") > 0) {
            textArr = text.split(".");
        } else {
            textArr = [text];
        }

        let tipsBefore = "";

        if (textArr.length > 1) {
            for (let i = 0; i < textArr.length - 1; i++) {
                let objectKey = textArr[i];
                //函数
                if (objectKey.indexOf('*') === 0) {
                    jsonObject[TABLE_FIELD_TYPE] = "Object";
                } else {
                    jsonObject = jsonObject[objectKey];
                }
                tipsBefore += objectKey + ".";
                text = text.substring(tipsBefore.length);
            }
        } 
        let structType = jsonObject[TABLE_FIELD_TYPE];

        if (structType === "Array") {
            let item : any = {};
            item.label = UNITTEST_FUNCTION_ARRAY_FIRST;
            item.value = tipsBefore + UNITTEST_FUNCTION_ARRAY_FIRST;
            result.push(item);

            item = {};
            item.label = UNITTEST_FUNCTION_ARRAY_RANDOM;
            item.value = tipsBefore + UNITTEST_FUNCTION_ARRAY_RANDOM;
            result.push(item);
        } else {
            delete jsonObject[TABLE_FIELD_TYPE];
            delete jsonObject[TABLE_FIELD_REMARK];
            delete jsonObject[TABLE_FIELD_VALUE];
            let tips = Object.keys(jsonObject).filter(key => (key.toLowerCase().indexOf(text) >= 0));
            for(let tip of tips) {
                let item : any = {};
                item.label = tip;
                item.value = tipsBefore + tip;
                result.push(item);
            }
        }

        cb(result);
    }

    async getValue(envVarTips: RequestSendTips, 
        paramData : object, headData : object, bodyData : object, responseData : object,
        unittest_executor_iterator : string, unittest_executor_unittest : string, unittest_executor_batch : string) {
        //环境变量 固定值
        if (this.dataSourceType === UNITTEST_DATASOURCE_TYPE_ENV) {
            let value = this.assertPrev as string;
            let beginIndex = value.indexOf("{{");
            let endIndex = value.indexOf("}}");
            if (beginIndex >= 0 && endIndex >= 0 && beginIndex < endIndex) {
                let envValueKey = value.substring(beginIndex + 2, endIndex);
                //指定项目环境变量
                if (envValueKey.indexOf(UNITTEST_STEP_PROJECT_POINTED) === 0) {
                    return "";
                } else {
                    //当前项目环境变量
                    value = envVarTips.getVarByKey(envValueKey) === undefined ? "" : envVarTips.getVarByKey(envValueKey) as string;
                }
            }
            return value;
        } else {
            //当前步骤
            if (this.selectedStep === UNITTEST_STEP_CURRENT) {
                //数据来源
                let dataSource : any;
                if (this.selectedDataSource === UNITTEST_STEP_PARAM) {
                    //当前步骤param
                    dataSource = paramData;
                } else if (this.selectedDataSource === UNITTEST_STEP_HEADER) {
                    //当前步骤header
                    dataSource = headData;
                } else if (this.selectedDataSource === UNITTEST_STEP_BODY) {
                    //当前步骤body
                    dataSource = bodyData;
                } else {
                    //当前步骤返回值
                    dataSource = responseData;
                }
                let pathArr : Array<string> = this.assertPrev?.split('.') as Array<string>;
                for(let _pathKey of pathArr) {
                    if (_pathKey === UNITTEST_FUNCTION_ARRAY_FIRST) {
                        dataSource = dataSource[0]
                    } else if (_pathKey === UNITTEST_FUNCTION_ARRAY_RANDOM) {
                        dataSource = dataSource[Math.floor(Math.random()*(dataSource.length))]
                    } else {
                        dataSource = dataSource[_pathKey];
                    }
                }
                return dataSource;
            } else {
                let stepId = this.selectedStep.substring(UNITTEST_STEP_POINTED.length);
                let unitTestExecutorRow = await window.db[TABLE_UNITTEST_EXECUTOR_NAME]
                .where([field_unittest_executor_iterator, field_unittest_executor_unittest, field_unittest_executor_batch, field_unittest_executor_step])
                .equals([unittest_executor_iterator, unittest_executor_unittest, unittest_executor_batch, stepId])
                .first();
                if (unitTestExecutorRow !== undefined && unitTestExecutorRow[field_unittest_executor_delFlg] === 0) {
                    //数据来源
                    let dataSource : any;
                    if (this.selectedDataSource === UNITTEST_STEP_PARAM) {
                        //指定步骤param
                        dataSource = unitTestExecutorRow[field_unittest_executor_param];
                    } else if (this.selectedDataSource === UNITTEST_STEP_HEADER) {
                        //指定步骤header
                        dataSource = unitTestExecutorRow[field_unittest_executor_header];
                    } else if (this.selectedDataSource === UNITTEST_STEP_BODY) {
                        //指定步骤body
                        dataSource = unitTestExecutorRow[field_unittest_executor_body];
                    } else {
                        //指定步骤response
                        dataSource = unitTestExecutorRow[field_unittest_executor_response];
                    }
                    let pathArr : Array<string> = this.assertPrev?.split('.') as Array<string>;
                    for(let _pathKey of pathArr) {
                        if (_pathKey === UNITTEST_FUNCTION_ARRAY_FIRST) {
                            if (dataSource.length > 0) {
                                dataSource = dataSource[0];
                            } else {
                                dataSource = {};
                            }
                        } else if (_pathKey === UNITTEST_FUNCTION_ARRAY_RANDOM) {
                            dataSource = dataSource[Math.floor(Math.random()*(dataSource.length))];
                        } else {
                            dataSource = dataSource[_pathKey];
                        }
                    }
                    return dataSource;
                }
     
                return "";
            }
        }
    }

    private trimContent = (content: string) : string => {
        let index1 = content.indexOf('{{');
        let index2 = content.indexOf('}}');
        if (index1 < index2) {
            let ret = content.substring(index1 + 2, index2);
            return ret;
        } else {
            return content;
        }
    }

    private parseFromStandardExpression(content : string) {
        if (!isStringEmpty(content)) {
            //步骤
            if (content.indexOf(UNITTEST_STEP_CURRENT) > 0 || content.indexOf(UNITTEST_STEP_POINTED) > 0) {
                this.dataSourceType = UNITTEST_DATASOURCE_TYPE_REF;
                this.selectedDataSource = this.trimContent(content).split('.')[1];
                this.assertPrev = "";
                for (let _index in this.trimContent(content).split('.')) {
                    if (_index > 1) {
                        this.assertPrev += this.trimContent(content).split('.')[_index] + ".";
                    }
                }
                this.assertPrev = this.assertPrev.substring(0, this.assertPrev.length - 1);
            } else {
                //环境变量 & 固定值
                this.dataSourceType = UNITTEST_DATASOURCE_TYPE_ENV;
                if (content.indexOf("{{") !== 0) {
                    //固定值
                    this.assertPrev = content;
                } else {
                    //环境变量
                    let tempArr = this.trimContent(content).split('.');
                    if (tempArr.length > 1) {
                        this.selectedProject = tempArr[0];
                        //环境变量 key
                        this.assertPrev = "{{" + tempArr[1] + "}}";
                    } else {
                        //环境变量 key
                        this.assertPrev = "{{" + tempArr[0] + "}}";
                    }
                }
            }

            if (content.indexOf(UNITTEST_STEP_POINTED) > 0) {
                this.selectedStep = this.trimContent(content).split('.')[0];
            }

            if (this.selectedProject !== UNITTEST_STEP_PROJECT_CURRENT) {
                this.currentProject = this.selectedProject.substring(UNITTEST_STEP_PROJECT_POINTED.length);
            }
        }
    }

}