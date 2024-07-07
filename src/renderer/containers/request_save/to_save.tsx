import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Descriptions, Breadcrumb, Flex, Layout, Tabs, Form, message, Button, Input, Divider, Select } from "antd";
import { cloneDeep } from 'lodash';
import { encode } from 'base-64';

import {
    isStringEmpty
} from '../../util';
import {
    TABLE_FIELD_NAME,
    TABLE_FIELD_TYPE,
    TABLE_FIELD_VALUE,
    TABLE_FIELD_TYPE_REF,
    genHash,
    iteratorGenHash,
    iteratorBodyGenHash,
    shortJsonContent,
    parseJsonToTable,
    retParseBodyJsonToTable,
    parseJsonToFilledTable,
    cleanJson,
} from '../../util/json';

import { createWindow } from '../../util/window';
import { ENV_VALUE_API_HOST } from "../../../config/envKeys";
import { 
    TABLE_ENV_VAR_FIELDS,
    TABLE_VERSION_ITERATION_FIELDS,
    TABLE_VERSION_ITERATION_REQUEST_FIELDS,
    TABLE_PROJECT_REQUEST_FIELDS,
    TABLE_REQUEST_HISTORY_FIELDS,
    TABLE_MICRO_SERVICE_FIELDS,
    TABLE_ENV_FIELDS,
} from '../../../config/db';
import {
    REQUEST_METHOD_GET,
    REQUEST_METHOD_POST,
    ChannelsOpenWindowStr,
    CONTENT_TYPE_URLENCODE,
    CONTENT_TYPE,
} from '../../../config/global_config';
import { VERSION_ITERATOR_ADD_ROUTE } from '../../../config/routers';
import { getEnvs } from '../../actions/env';
import { getPrjs } from '../../actions/project';
import { getEnvValues } from '../../actions/env_value';
import { getOpenVersionIteratorsByPrj } from '../../actions/version_iterator';
import { getVersionIteratorRequest } from '../../actions/version_iterator_requests';
import { getProjectRequest } from '../../actions/project_request';
import { getRequestHistory } from '../../actions/request_history';
import { addJsonFragement } from '../../actions/request_save';
import { 
    addVersionIteratorFolder,
    getVersionIteratorFolders 
} from '../../actions/version_iterator_folders';
import { addProjectRequest } from '../../actions/project_request';
import { addVersionIteratorRequest } from '../../actions/version_iterator_requests';
import JsonSaveParamTableContainer from "../../components/request_save/json_save_table_param";
import JsonSaveBodyTableContainer from "../../components/request_save/json_save_table_body";
import JsonSaveHeaderTableContainer from "../../components/request_save/json_save_table_header";
import JsonSaveResponseTableComponent from "../../components/request_save/json_save_table_response";

const { Header, Content, Footer } = Layout;

let request_history_env = TABLE_REQUEST_HISTORY_FIELDS.FIELD_ENV_LABEL;
let request_history_micro_service = TABLE_REQUEST_HISTORY_FIELDS.FIELD_MICRO_SERVICE_LABEL;
let request_history_uri = TABLE_REQUEST_HISTORY_FIELDS.FIELD_URI;
let request_history_method = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_METHOD;
let request_history_head = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_HEADER;
let request_history_body = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_BODY;
let request_history_file = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_FILE;
let request_history_param = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_PARAM;
let request_history_response = TABLE_REQUEST_HISTORY_FIELDS.FIELD_RESPONSE_CONTENT;
let request_history_jsonFlg = TABLE_REQUEST_HISTORY_FIELDS.FIELD_JSONFLG;
let request_history_htmlFlg = TABLE_REQUEST_HISTORY_FIELDS.FIELD_HTMLFLG;

let version_iterator_request_title = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_TITLE;
let version_iterator_request_fold = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_FOLD;
let version_iterator_request_jsonflg = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_JSONFLG;
let version_iterator_request_header = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_HEADER;
let version_iterator_request_body = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_BODY;
let version_iterator_request_param = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_PARAM;
let version_iterator_request_response = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_RESPONSE_CONTENT;

let project_request_title = TABLE_PROJECT_REQUEST_FIELDS.FIELD_TITLE;
let project_request_fold = TABLE_PROJECT_REQUEST_FIELDS.FIELD_FOLD;
let project_request_jsonflg = TABLE_PROJECT_REQUEST_FIELDS.FIELD_JSONFLG;
let project_request_header = TABLE_PROJECT_REQUEST_FIELDS.FIELD_REQUEST_HEADER;
let project_request_body = TABLE_PROJECT_REQUEST_FIELDS.FIELD_REQUEST_BODY;
let project_request_param = TABLE_PROJECT_REQUEST_FIELDS.FIELD_REQUEST_PARAM;
let project_request_response = TABLE_PROJECT_REQUEST_FIELDS.FIELD_RESPONSE_CONTENT;

let version_iterator_uuid = TABLE_VERSION_ITERATION_FIELDS.FIELD_UUID;
let version_iterator_name = TABLE_VERSION_ITERATION_FIELDS.FIELD_NAME;
let version_iterator_prjs = TABLE_VERSION_ITERATION_FIELDS.FIELD_PROJECTS;

let env_var_pname = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_NAME;
let env_var_pvalue = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_VAR;

let env_label = TABLE_ENV_FIELDS.FIELD_LABEL;
let env_remark = TABLE_ENV_FIELDS.FIELD_REMARK;

let prj_label = TABLE_MICRO_SERVICE_FIELDS.FIELD_LABEL;
let prj_remark = TABLE_MICRO_SERVICE_FIELDS.FIELD_REMARK;

class RequestSaveContainer extends Component {

    constructor(props) {
        super(props);

        let iteratorId = props.match.params.versionIteratorId;
        let prjsSelectector = [];
        if (!isStringEmpty(iteratorId)) {
            let prjs = this.props.versionIterators.find(row => row[version_iterator_uuid] === iteratorId)[version_iterator_prjs]
            for(let prj of prjs) {
                let prjRemark = this.props.prjs.find(row => row[prj_label] === prj)[prj_remark];
                prjsSelectector.push({label: prjRemark, value: prj});
            }
        }

        this.state = {
            prj : null,
            env : "",
            title : "",
            requestHost: "",
            requestUri: "",
            requestMethod: "",
            responseDemo: "",
            formResponseData: {},
            responseHash: "",
            isResonseJson: false,
            requestHeadData: {},
            formRequestHeadData: {},
            requestHeaderHash: "",
            formRequestBodyData: {},
            requestBodyHash: "",
            formRequestParamData: {},
            requestParamHash: "",
            isResponseHtml: false,
            stopFlg : true,
            showFlg : false,
            versionIterator: iteratorId,
            prjsSelectector,
            selectedFolder: "",
            folderName: "",
            versionIteratorsSelector: [],
            folders: [],
            contentType: "",
        }
    }

    componentDidMount(): void {
        if(this.props.envs.length === 0) {
            getEnvs(this.props.dispatch);
        }
        if(this.props.prjs.length === 0) {
            getPrjs(this.props.dispatch);
        }

        if (!isStringEmpty(this.props.match.params.historyId)) {
            let historyId = Number(this.props.match.params.historyId);
            this.initFromRequestHistory(historyId);
        } else {
            this.setState({
                showFlg: true,
                requestMethod : REQUEST_METHOD_POST,
                contentType: CONTENT_TYPE_URLENCODE,
            });
        }
    }

    initFromRequestHistory = (historyId : number) => {
        getRequestHistory(historyId, record => {
            let prj = record[request_history_micro_service];
            let method = record[request_history_method];
            let uri = record[request_history_uri];
            let env = record[request_history_env];

            this.initByIteratorPrjEnv(this.state.versionIterator, prj, env);

            if (!isStringEmpty(this.state.versionIterator)) {
                getVersionIteratorRequest(this.state.versionIterator, prj, method, uri).then(versionIterationRequest => {
                    if (versionIterationRequest !== null) {
                        if (record[version_iterator_request_jsonflg]) {
                            let requestHeadData = record[request_history_head];
                            let shortRequestHeadJsonObject = {};
                            shortJsonContent(shortRequestHeadJsonObject, requestHeadData);
                            let requestHeaderHash = iteratorGenHash(shortRequestHeadJsonObject);
                            let formRequestHeadData = {};
                            parseJsonToFilledTable(formRequestHeadData, shortRequestHeadJsonObject, versionIterationRequest[version_iterator_request_header]);
                            let requestBodyData = record[request_history_body];
                            let shortRequestBodyJsonObject = {};
                            shortJsonContent(shortRequestBodyJsonObject, requestBodyData);
                            let requestFileData = record[request_history_file];
                            let requestBodyHash = iteratorBodyGenHash(shortRequestBodyJsonObject, requestFileData);
                            let formRequestBodyData = {};
                            parseJsonToFilledTable(formRequestBodyData, shortRequestBodyJsonObject, versionIterationRequest[version_iterator_request_body]);
                            parseJsonToFilledTable(formRequestBodyData, requestFileData, versionIterationRequest[version_iterator_request_body]);
                            let requestParamData = record[request_history_param];
                            let shortRequestParamJsonObject = {};
                            shortJsonContent(shortRequestParamJsonObject, requestParamData);
                            let requestParamHash = iteratorGenHash(shortRequestParamJsonObject);
                            let formRequestParamData = {};
                            parseJsonToFilledTable(formRequestParamData, shortRequestParamJsonObject, versionIterationRequest[version_iterator_request_param]);
                            let responseData = JSON.parse(record[request_history_response]);
                            let shortResponseJsonObject = {};
                            shortJsonContent(shortResponseJsonObject, responseData);
                            let responseHash = iteratorGenHash(shortResponseJsonObject);
                            let formResponseData = {};
                            parseJsonToFilledTable(formResponseData, shortResponseJsonObject, versionIterationRequest[version_iterator_request_response]);
                            this.setState({
                                showFlg: true,
                                prj,
                                env: record[request_history_env],
                                title: versionIterationRequest[version_iterator_request_title],
                                selectedFolder: versionIterationRequest[version_iterator_request_fold],
                                requestUri: uri,
                                requestMethod: method,
                                isResonseJson: record[version_iterator_request_jsonflg],
                                isResponseHtml: record[request_history_htmlFlg],
                                formRequestHeadData,
                                requestHeaderHash,
                                formRequestBodyData,
                                requestBodyHash,
                                formRequestParamData,
                                requestParamHash,
                                formResponseData,
                                responseHash,
                                responseDemo: JSON.stringify(shortResponseJsonObject),
                            });
                        }
                    } else {
                        this.simpleBootByRequestHistoryRecord(record, prj, method, uri);
                    }
                });
            } else {
                getProjectRequest(prj, method, uri).then(projectRequest => {
                    if (projectRequest !== null) {
                        if (record[project_request_jsonflg]) {
                            let requestHeadData = record[request_history_head];
                            let shortRequestHeadJsonObject = {};
                            shortJsonContent(shortRequestHeadJsonObject, requestHeadData);
                            let requestHeaderHash = iteratorGenHash(shortRequestHeadJsonObject);
                            let formRequestHeadData = {};
                            parseJsonToFilledTable(formRequestHeadData, shortRequestHeadJsonObject, projectRequest[project_request_header]);
                            let requestBodyData = record[request_history_body];
                            let shortRequestBodyJsonObject = {};
                            shortJsonContent(shortRequestBodyJsonObject, requestBodyData);
                            let requestBodyHash = iteratorGenHash(shortRequestBodyJsonObject);
                            let formRequestBodyData = {};
                            parseJsonToFilledTable(formRequestBodyData, shortRequestBodyJsonObject, projectRequest[project_request_body]);
                            let requestParamData = record[request_history_param];
                            let shortRequestParamJsonObject = {};
                            shortJsonContent(shortRequestParamJsonObject, requestParamData);
                            let requestParamHash = iteratorGenHash(shortRequestParamJsonObject);
                            let formRequestParamData = {};
                            parseJsonToFilledTable(formRequestParamData, shortRequestParamJsonObject, projectRequest[project_request_param]);
                            let responseData = JSON.parse(record[request_history_response]);
                            let shortResponseJsonObject = {};
                            shortJsonContent(shortResponseJsonObject, responseData);
                            let responseHash = iteratorGenHash(shortResponseJsonObject);
                            let formResponseData = {};
                            parseJsonToFilledTable(formResponseData, shortResponseJsonObject, projectRequest[project_request_response]);
                            this.setState({
                                showFlg: true,
                                prj,
                                env: record[request_history_env],
                                title: projectRequest[project_request_title],
                                selectedFolder: projectRequest[project_request_fold],
                                requestUri: uri,
                                requestMethod: method,
                                isResonseJson: record[version_iterator_request_jsonflg],
                                isResponseHtml: record[request_history_htmlFlg],
                                formRequestHeadData,
                                requestHeaderHash,
                                formRequestBodyData,
                                requestBodyHash,
                                formRequestParamData,
                                requestParamHash,
                                formResponseData,
                                responseHash,
                                responseDemo: JSON.stringify(shortResponseJsonObject),
                            });
                        }
                    } else {
                        this.simpleBootByRequestHistoryRecord(record, prj, method, uri);
                    }
                });
            }
        });
    }

    initByIteratorPrjEnv = (versionIterator: string, prj: string, env: string) => {
        if (!isStringEmpty(versionIterator)) {
            getVersionIteratorFolders(versionIterator, prj, folders => this.setState({folders}));
        }

        this.getEnvValueData(prj, env);
        if (isStringEmpty(this.state.versionIterator)) {
            this.refreshVersionIteratorData(prj);
        }
    }

    simpleBootByRequestHistoryRecord = (historyRecord: any, prj : string, method : string, uri : string) => {
        if (historyRecord[request_history_jsonFlg]) {
            let requestHeadData = historyRecord[request_history_head];
            let shortRequestHeadJsonObject = {};
            shortJsonContent(shortRequestHeadJsonObject, requestHeadData);
            let requestHeaderHash = iteratorGenHash(shortRequestHeadJsonObject);
            let formRequestHeadData = {};
            parseJsonToTable(formRequestHeadData, shortRequestHeadJsonObject);
            let requestBodyData = historyRecord[request_history_body];
            let requestFileData = historyRecord[request_history_file];
            let shortRequestBodyJsonObject = {};
            shortJsonContent(shortRequestBodyJsonObject, requestBodyData);
            let requestBodyHash = iteratorBodyGenHash(shortRequestBodyJsonObject, requestFileData);
            let formRequestBodyData = retParseBodyJsonToTable(shortRequestBodyJsonObject, requestFileData);

            let requestParamData = historyRecord[request_history_param];
            let shortRequestParamJsonObject = {};
            shortJsonContent(shortRequestParamJsonObject, requestParamData);
            let requestParamHash = iteratorGenHash(shortRequestParamJsonObject);
            let formRequestParamData = {};
            parseJsonToTable(formRequestParamData, shortRequestParamJsonObject);

            let responseData = JSON.parse(historyRecord[request_history_response]);
            let shortResponseJsonObject = {};
            shortJsonContent(shortResponseJsonObject, responseData);
            let responseHash = iteratorGenHash(shortResponseJsonObject);
            let formResponseData = {};
            parseJsonToTable(formResponseData, shortResponseJsonObject);
            this.setState({
                showFlg: true,
                prj,
                env: historyRecord[request_history_env],
                requestUri: uri,
                requestMethod: method,
                isResonseJson: historyRecord[request_history_jsonFlg],
                isResponseHtml: historyRecord[request_history_htmlFlg],
                formRequestHeadData,
                requestHeaderHash,
                formRequestBodyData,
                requestBodyHash,
                formRequestParamData,
                requestParamHash,
                formResponseData,
                responseHash,
                responseDemo: JSON.stringify(shortResponseJsonObject),
            });
        }
    }

    handleRequestProject = prj => {
        this.setState( {prj} );
        getVersionIteratorFolders(this.state.versionIterator, prj, folders => this.setState({folders}));
    }

    handleCreateIterator = () => {
        let windowId = createWindow('#' + VERSION_ITERATOR_ADD_ROUTE);
        let listener = window.electron.ipcRenderer.on(ChannelsOpenWindowStr, (receivedWindowId) => {
            if(windowId === receivedWindowId) {
                listener(); //收到消息，移除监听器
                this.refreshVersionIteratorData(this.state.prj);
            }
        });
    }

    handleSetVersionIterator = (value) => {
        this.setState({ versionIterator : value});
        getVersionIteratorFolders(value, this.state.prj, folders => this.setState({folders}));
    }

    handleCreateFolder = () => {
        addVersionIteratorFolder(this.state.versionIterator, this.state.prj, this.state.folderName, this.props.device, ()=>{
            this.setState({folderName: ""});
            getVersionIteratorFolders(this.state.versionIterator, this.state.prj, folders => this.setState({folders}));
        });
    }

    handleSave = async () => {
        if (isStringEmpty(this.state.title)){
            message.error("接口说明必填");
            return;
        }
        if (isStringEmpty(this.state.prj)){
            message.error("请选择涉及的项目");
            return;
        }
        //新增接口时的校验
        if (isStringEmpty(this.props.match.params.historyId)) {
            if (isStringEmpty(this.state.versionIterator)) {
                message.error("只能在迭代中直接新增 api ");
                return;
            }
            if (isStringEmpty(this.state.requestUri)) {
                message.error("请填写接口 uri");
                return;
            }
            if (this.state.requestUri.substring(0, 1) === "/") {
                message.error("接口 uri 不能以 / 开头");
                return;
            }
            if (isStringEmpty(this.state.responseDemo)) {
                message.error("请填写接口预返回的 json 报文示例");
                return;
            }
        }

        let whitekeys : Array<any> = [];
        let formResponseDataCopy = cloneDeep(this.state.formResponseData);

        while(true) {
            this.state.stopFlg = true;
            this.parseJsonToStruct(whitekeys, [], "", formResponseDataCopy, formResponseDataCopy);
            if(this.state.stopFlg) break;
        }

        //新增（只能新增迭代接口）
        if (isStringEmpty(this.props.match.params.historyId)) {
            this.state.requestHeaderHash = iteratorGenHash(cleanJson(this.state.formRequestHeadData));
            this.state.requestBodyHash = iteratorGenHash(cleanJson(this.state.formRequestBodyData));
            this.state.requestParamHash = iteratorGenHash(cleanJson(this.state.formRequestParamData));
            this.state.responseHash = iteratorGenHash(cleanJson(this.state.formResponseData));
            this.state.isResonseJson = true;
            this.state.isResponseHtml = false;

            //新增迭代接口
            await addVersionIteratorRequest(this.state.versionIterator, this.state.prj, this.state.requestMethod, this.state.requestUri,
                this.state.title, this.state.selectedFolder, 
                this.state.formRequestHeadData, this.state.requestHeaderHash, this.state.formRequestBodyData, this.state.requestBodyHash, this.state.formRequestParamData, this.state.requestParamHash, this.state.formResponseData, this.state.responseHash, this.state.responseDemo,
                this.state.isResonseJson, this.state.isResponseHtml,
                this.props.device
            );
            message.success("新增成功");
            this.props.history.push("#/version_iterator_request/" + this.state.versionIterator + "/" + this.state.prj + "/" + this.state.requestMethod + "/" + encode(this.state.requestUri));
        } else {
            //编辑
            if (isStringEmpty(this.state.versionIterator)){
                //编辑项目接口
                await addProjectRequest(this.state.prj, this.state.requestMethod, this.state.requestUri,
                    this.state.title, this.state.selectedFolder,
                    this.state.formRequestHeadData, this.state.requestHeaderHash, this.state.formRequestBodyData, this.state.requestBodyHash, this.state.formRequestParamData, this.state.requestParamHash, this.state.formResponseData, this.state.responseHash, this.state.responseDemo,
                    this.state.isResonseJson, this.state.isResponseHtml, 
                    this.props.device
                );
                message.success("保存成功");
                this.props.history.push("#/version_iterator_request/" + this.state.prj + "/" + this.state.requestMethod + "/" + encode(this.state.requestUri));
            } else {
                //编辑迭代接口
                await addVersionIteratorRequest(this.state.versionIterator, this.state.prj, this.state.requestMethod, this.state.requestUri,
                    this.state.title, this.state.selectedFolder, 
                    this.state.formRequestHeadData, this.state.requestHeaderHash, this.state.formRequestBodyData, this.state.requestBodyHash, this.state.formRequestParamData, this.state.requestParamHash, this.state.formResponseData, this.state.responseHash, this.state.responseDemo,
                    this.state.isResonseJson, this.state.isResponseHtml,
                    this.props.device
                );
                message.success("保存成功");
                this.props.history.push("#/version_iterator_request/" + this.state.versionIterator + "/" + this.state.prj + "/" + this.state.requestMethod + "/" + encode(this.state.requestUri));
            }
        }
    }

    parseJsonToStruct = (whiteKeys : Array<any>, parentKeys : Array<string>, parentKey : string, parseJsonToTableResultCopy : object, content : object) => {
        let isPrimimaryObject = true;
        for(let key in content) {
            let type = content[key][TABLE_FIELD_TYPE];
            if ((type === "Object" || type === "Array") && !whiteKeys.includes(key)) {
                this.state.stopFlg = false;
                parentKeys.push(key);
                this.parseJsonToStruct(whiteKeys, parentKeys, key, parseJsonToTableResultCopy, content[key]);
                parentKeys.pop();
                isPrimimaryObject = false;
            }
        }
        if (isPrimimaryObject){
            whiteKeys.push(parentKey);
            this.handlePrimimaryObject(parentKeys, parentKey, parseJsonToTableResultCopy, content);
        }
    }

    handlePrimimaryObject = (parentKeys : Array<string>, parentKey : string, parseJsonToTableResultCopy : object, content : object) : void => {
        let hash = genHash(content);
        let newObject = {};
        newObject[TABLE_FIELD_NAME] = parentKey + "@" + hash;
        newObject[TABLE_FIELD_VALUE] = content;
        addJsonFragement(newObject);

        let replaceObj = parseJsonToTableResultCopy;
        let i = 0;
        for(let _key of parentKeys) {
            i ++;
            if ( i === parentKeys.length ) {
                replaceObj[_key] = {};
                replaceObj[_key][TABLE_FIELD_NAME] = parentKey + "@" + hash;
                replaceObj[_key][TABLE_FIELD_TYPE] = TABLE_FIELD_TYPE_REF;
            }
            replaceObj = replaceObj[_key];
        }
    }

    getNavs() {
        return [
          {
            key: 'params',
            label: '参数',
            children: <JsonSaveParamTableContainer 
                readOnly={ !isStringEmpty(this.props.match.params.historyId) } 
                object={this.state.formRequestParamData} 
                cb={obj=>this.setState({formRequestParamData: obj})} />,
          },
          {
            key: 'headers',
            label: '头部',
            children: <JsonSaveHeaderTableContainer 
                readOnly={ !isStringEmpty(this.props.match.params.historyId) } 
                contentType={ this.state.contentType }
                object={this.state.formRequestHeadData} 
                cb={ obj => this.setState({formRequestHeadData: obj, contentType: obj[CONTENT_TYPE][TABLE_FIELD_VALUE]})} />,
          },
          {
            key: 'body',
            label: '主体',
            children: <JsonSaveBodyTableContainer 
                readOnly={ !isStringEmpty(this.props.match.params.historyId) } 
                contentType={ this.state.contentType }
                object={this.state.formRequestBodyData} 
                cb={obj=>this.setState({formRequestBodyData: obj})} />,
          },
        ];
    }

    getEnvValueData = (prj: string, env: string) => {
        if(!(isStringEmpty(prj) || isStringEmpty(env))) {
          getEnvValues(prj, env, this.props.dispatch, env_vars => {
            if(env_vars.length === 0) {
              message.error("项目和环境已被删除，该请求无法保存到迭代");
              return;
            }
            for(let env_value of env_vars) {
              if(env_value[env_var_pname] === ENV_VALUE_API_HOST) {
                let requestHost = env_value[env_var_pvalue];
                if (isStringEmpty(requestHost)) {
                  message.error("环境变量" + ENV_VALUE_API_HOST + "项目和环境已被删除，该请求无法保存到迭代");
                  return;
                }
                this.setState({
                  requestHost,
                  prj,
                  env,
                });
              }
            }
          })
          
        }
    }

    refreshVersionIteratorData = prj => {
        getOpenVersionIteratorsByPrj(prj, versionIterators => {
            let versionIteratorsSelector = [];
            for(let _index in versionIterators) {
                let versionIteratorsItem = {};

                let uuid = versionIterators[_index][version_iterator_uuid];
                let title = versionIterators[_index][version_iterator_name];
                versionIteratorsItem.label = title;
                versionIteratorsItem.value = uuid;
                versionIteratorsSelector.push(versionIteratorsItem);
            }
            this.setState({versionIteratorsSelector});
          });
    }

    render() : ReactNode {
        return (
            <Layout>
                <Header style={{ padding: 0 }}>
                    保存到迭代
                </Header>
                {this.state.showFlg ? 
                <Content style={{ margin: '0 16px' }}>
                    <Breadcrumb style={{ margin: '16px 0' }} items={[
                        { title: '请求' }, 
                        { title: '保存' }
                    ]} />
                    <Flex vertical gap="middle">
                        <Flex justify="space-between" align="center">
                            <Descriptions items={ [
                            {
                                key: 'prj',
                                label: '项目',
                                children: isStringEmpty(this.props.match.params.historyId) ? 
                                <Select
                                    value={this.state.prj}
                                    placeholder="选择项目"
                                    style={{ width: 174 }}
                                    options={ this.state.prjsSelectector }
                                    onChange={ this.handleRequestProject }
                                />
                                : 
                                (this.props.prjs.find(row => row[prj_label] === this.state.prj) ? this.props.prjs.find(row => row[prj_label] === this.state.prj)[prj_remark] : ""),
                            },
                            {
                                key: isStringEmpty(this.state.versionIterator) ? 'env' : 'iterator',
                                label: isStringEmpty(this.state.versionIterator) ? '环境' : '迭代',
                                children: isStringEmpty(this.state.versionIterator) ? 
                                (this.props.envs.find(row => row[env_label] === this.state.env) ? this.props.envs.find(row => row[env_label] === this.state.env)[env_remark] : "") 
                                : 
                                (this.props.versionIterators.find(row => row[version_iterator_uuid] === this.state.versionIterator)[version_iterator_name]),
                            }
                            ] } />
                        </Flex>
                        <Flex justify="flex-start" align="center" gap="middle">
                            <Form layout="inline">
                                <Form.Item label="标题">
                                    <Input value={this.state.title} onChange={event=>this.setState({title: event.target.value})} placeholder='接口说明' />
                                </Form.Item>

                                {isStringEmpty(this.state.versionIterator) ? 
                                <Form.Item label="选择需求迭代">
                                    <Select
                                        showSearch
                                        allowClear
                                        placeholder="选择需求迭代版本"
                                        optionFilterProp="label"
                                        style={{minWidth: 160}}
                                        onChange={this.handleSetVersionIterator}
                                        value={this.state.versionIterator}
                                        
                                        dropdownRender={(menu) => (
                                            <>
                                            {menu}
                                            <Divider style={{ margin: '8px 0' }} />
                                            <Button type="link" onClick={this.handleCreateIterator}>新建需求迭代</Button>
                                            </>
                                        )}
                                        options={this.state.versionIteratorsSelector}
                                    />
                                </Form.Item>
                                : null }
                                <Form.Item label="选择文件夹">
                                    <Select
                                        style={{minWidth: 130}}
                                        value={ this.state.selectedFolder }
                                        onChange={ value => this.setState({selectedFolder: value}) }
                                        dropdownRender={(menu) => (
                                            <>
                                                {menu}
                                                <Divider style={{ margin: '8px 0' }} />
                                                <Input
                                                    placeholder="回车新建文件夹"
                                                    onChange={e => { this.setState({ folderName: e.target.value }) }}
                                                    value={ this.state.folderName }
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter') {
                                                            this.handleCreateFolder();
                                                        }
                                                        e.stopPropagation()
                                                    }}
                                                />
                                            </>
                                        )}
                                        options={ this.state.folders }
                                    />
                                </Form.Item>
                            </Form>
                        </Flex>
                        <Flex>
                            <Select 
                                style={{borderRadius: 0, width: 118}} 
                                size='large' 
                                disabled={ !isStringEmpty(this.props.match.params.historyId) }
                                onChange={ value => this.setState({requestMethod: value}) }
                                value={ this.state.requestMethod }>
                                <Select.Option value={ REQUEST_METHOD_POST }>{ REQUEST_METHOD_POST }</Select.Option>
                                <Select.Option value={ REQUEST_METHOD_GET }>{ REQUEST_METHOD_GET }</Select.Option>
                            </Select>
                            <Input 
                                style={{borderRadius: 0}} 
                                prefix={ isStringEmpty(this.state.requestHost) ? "{{" + ENV_VALUE_API_HOST + "}}" : this.state.requestHost } 
                                disabled={ !isStringEmpty(this.props.match.params.historyId) }
                                value={ this.state.requestUri } 
                                onChange={event => this.setState({requestUri: event.target.value})}
                                size='large' />
                            <Button 
                                size='large' 
                                type="primary" 
                                style={{borderRadius: 0}} 
                                onClick={ this.handleSave }
                                >保存</Button>
                        </Flex>
                        <Tabs defaultActiveKey={ this.state.requestMethod === REQUEST_METHOD_POST ? "body" : "params" } items={ this.getNavs() } />
                        <Divider orientation="left">响应</Divider>
                        <Flex>
                            <JsonSaveResponseTableComponent 
                                readOnly={ !isStringEmpty(this.props.match.params.historyId) } 
                                object={ this.state.formResponseData } 
                                jsonStr={ this.state.responseDemo }
                                cb={(obj, demo) => this.setState({formResponseData: obj, responseDemo: demo})} />
                        </Flex>
                    </Flex>
                </Content>
                : null}
                <Footer style={{ textAlign: 'center' }}>
                    MyPostMan ©{new Date().getFullYear()} Created by 方海亮
                </Footer>
            </Layout>
        )
    }
}

function mapStateToProps (state) {
    return {
        envs: state.env.list,
        prjs: state.prj.list,
        versionIterators: state['version_iterator'].list,
        device : state.device,
    }
}
  
export default connect(mapStateToProps)(RequestSaveContainer);