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
    shortJsonContent,
    parseJsonToTable,
} from '../../util/json';
import { createWindow } from '../../util/window';
import { ENV_VALUE_API_HOST } from "../../../config/envKeys";
import { 
    TABLE_ENV_VAR_FIELDS,
    TABLE_VERSION_ITERATION_FIELDS,
    TABLE_REQUEST_HISTORY_FIELDS,
    TABLE_MICRO_SERVICE_FIELDS,
    TABLE_ENV_FIELDS,
} from '../../../config/db';
import {
    REQUEST_METHOD_GET,
    REQUEST_METHOD_POST,
    ChannelsOpenWindowStr
} from '../../../config/global_config';
import { VERSION_ITERATOR_ADD_ROUTE } from '../../../config/routers';
import { getEnvs } from '../../actions/env';
import { getPrjs } from '../../actions/project';
import { getEnvValues } from '../../actions/env_value';
import { getOpenVersionIteratorsByPrj } from '../../actions/version_iterator';
import { getRequestHistory } from '../../actions/request_history';
import { addJsonFragement } from '../../actions/request_save';
import { 
    addVersionIteratorFolder,
    getVersionIteratorFolders 
} from '../../actions/version_iterator_folders';
import { addProjectRequest } from '../../actions/project_request';
import { addVersionIteratorRequest } from '../../actions/version_iterator_requests';
import JsonSaveTableComponent from "../../components/request_save/json_save_table";

const { Header, Content, Footer } = Layout;

let request_history_env = TABLE_REQUEST_HISTORY_FIELDS.FIELD_ENV_LABEL;
let request_history_micro_service = TABLE_REQUEST_HISTORY_FIELDS.FIELD_MICRO_SERVICE_LABEL;
let request_history_uri = TABLE_REQUEST_HISTORY_FIELDS.FIELD_URI;
let request_history_method = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_METHOD;
let request_history_head = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_HEADER;
let request_history_body = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_BODY;
let request_history_param = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_PARAM;
let request_history_response = TABLE_REQUEST_HISTORY_FIELDS.FIELD_RESPONSE_CONTENT;
let request_history_jsonFlg = TABLE_REQUEST_HISTORY_FIELDS.FIELD_JSONFLG;
let request_history_htmlFlg = TABLE_REQUEST_HISTORY_FIELDS.FIELD_HTMLFLG;

let version_iterator_uuid = TABLE_VERSION_ITERATION_FIELDS.FIELD_UUID;
let version_iterator_name = TABLE_VERSION_ITERATION_FIELDS.FIELD_NAME;

let env_var_pname = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_NAME;
let env_var_pvalue = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_VAR;

let env_label = TABLE_ENV_FIELDS.FIELD_LABEL;
let env_remark = TABLE_ENV_FIELDS.FIELD_REMARK;

let prj_label = TABLE_MICRO_SERVICE_FIELDS.FIELD_LABEL;
let prj_remark = TABLE_MICRO_SERVICE_FIELDS.FIELD_REMARK;

class RequestSaveContainer extends Component {

    constructor(props) {
        super(props);
        this.state = {
            prj : "",
            env : "",
            title : "",
            requestHost: "",
            requestUri: "",
            requestMethod: "",
            responseDemo: "",
            formResponseData: {},
            responseHash: "",
            isResonseJson: false,
            formRequestHeadData: {},
            requestHeaderHash: "",
            formRequestBodyData: {},
            requestBodyHash: "",
            formRequestParamData: {},
            requestParamHash: "",
            isResponseHtml: false,
            stopFlg : true,
            showFlg : false,
            versionIterator: "",
            selectedFolder: "",
            folderName: "",
            versionIteratorsSelector: [],
            folders: [],
        }
    }

    componentDidMount(): void {
        if(this.props.envs.length === 0) {
            getEnvs(this.props.dispatch);
        }
        if(this.props.prjs.length === 0) {
            getPrjs(this.props.dispatch);
        }

        let locationArr = window.location.href.split("/");
        let locationArrNum = locationArr.length;
        let param = locationArr[locationArrNum - 1];
        let key = Number(param);
        getRequestHistory(key, record => {

            let prj = record[request_history_micro_service];

            getVersionIteratorFolders(this.state.versionIterator, prj, folders => this.setState({folders}));

            this.getEnvValueData(record[request_history_micro_service], record[request_history_env]);
            this.refreshVersionIteratorData(record[request_history_micro_service]);

            if (record[request_history_jsonFlg]) {
                let requestHeadData = record[request_history_head];
                let shortRequestHeadJsonObject = {};
                shortJsonContent(shortRequestHeadJsonObject, requestHeadData);
                let requestHeaderHash = iteratorGenHash(shortRequestHeadJsonObject);
                let formRequestHeadData = {};
                parseJsonToTable(formRequestHeadData, shortRequestHeadJsonObject);
                let requestBodyData = record[request_history_body];
                let shortRequestBodyJsonObject = {};
                shortJsonContent(shortRequestBodyJsonObject, requestBodyData);
                let requestBodyHash = iteratorGenHash(shortRequestBodyJsonObject);
                let formRequestBodyData = {};
                parseJsonToTable(formRequestBodyData, shortRequestBodyJsonObject);
                let requestParamData = record[request_history_param];
                let shortRequestParamJsonObject = {};
                shortJsonContent(shortRequestParamJsonObject, requestParamData);
                let requestParamHash = iteratorGenHash(shortRequestParamJsonObject);
                let formRequestParamData = {};
                parseJsonToTable(formRequestParamData, shortRequestParamJsonObject);

                let responseData = JSON.parse(record[request_history_response]);
                let shortResponseJsonObject = {};
                shortJsonContent(shortResponseJsonObject, responseData);
                let responseHash = iteratorGenHash(shortResponseJsonObject);
                let formResponseData = {};
                parseJsonToTable(formResponseData, shortResponseJsonObject);
                this.setState({
                    showFlg: true,
                    prj,
                    env: record[request_history_env],
                    requestUri: record[request_history_uri],
                    requestMethod: record[request_history_method],
                    isResonseJson: record[request_history_jsonFlg],
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
        });
    }

    handleCreateIterator = () => {
        let windowId = createWindow('#' + VERSION_ITERATOR_ADD_ROUTE);
        window.electron.ipcRenderer.on(ChannelsOpenWindowStr, (receivedWindowId) => {
            if(windowId === receivedWindowId) {
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

        let whitekeys : Array<any> = [];
        let formResponseDataCopy = cloneDeep(this.state.formResponseData);

        while(true) {
            this.state.stopFlg = true;
            this.parseJsonToStruct(whitekeys, [], "", formResponseDataCopy, formResponseDataCopy);
            if(this.state.stopFlg) break;
        }
        if (isStringEmpty(this.state.versionIterator)){
            await addProjectRequest(this.state.prj, this.state.requestMethod, this.state.requestUri,
                this.state.title, this.state.selectedFolder,
                this.state.formRequestHeadData, this.state.requestHeaderHash, this.state.formRequestBodyData, this.state.requestBodyHash, this.state.formRequestParamData, this.state.requestParamHash, this.state.formResponseData, this.state.responseHash, this.state.responseDemo,
                this.state.isResonseJson, this.state.isResponseHtml, this.props.device);
            message.success("保存成功");
        } else {
            await addVersionIteratorRequest(this.state.versionIterator, this.state.prj, this.state.requestMethod, this.state.requestUri,
                this.state.title, this.state.selectedFolder, 
                this.state.formRequestHeadData, this.state.requestHeaderHash, this.state.formRequestBodyData, this.state.requestBodyHash, this.state.formRequestParamData, this.state.requestParamHash, this.state.formResponseData, this.state.responseHash, this.state.responseDemo,
                this.state.isResonseJson, this.state.isResponseHtml,
                this.props.device
            );
            message.success("保存成功");
            let urlStr = encode(this.state.versionIterator + "$$" + this.state.prj + "$$" + this.state.requestMethod + "$$" + this.state.requestUri);
            window.location.href = "#/version_iterator_request/" + urlStr;
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
            children: <JsonSaveTableComponent readOnly={true} object={this.state.formRequestParamData} cb={obj=>this.setState({formRequestParamData: obj})} />,
          },
          {
            key: 'headers',
            label: '头部',
            children: <JsonSaveTableComponent readOnly={true} object={this.state.formRequestHeadData} cb={obj=>this.setState({formRequestHeadData: obj})} />,
          },
          {
            key: 'body',
            label: '主体',
            children: <JsonSaveTableComponent readOnly={true} object={this.state.formRequestBodyData} cb={obj=>this.setState({formRequestBodyData: obj})} />,
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
                                children: this.props.prjs.find(row => row[prj_label] === this.state.prj) ? this.props.prjs.find(row => row[prj_label] === this.state.prj)[prj_remark] : "",
                            },
                            {
                                key: 'env',
                                label: '环境',
                                children: this.props.envs.find(row => row[env_label] === this.state.env) ? this.props.envs.find(row => row[env_label] === this.state.env)[env_remark] : "",
                            }
                            ] } />
                        </Flex>
                        <Flex justify="flex-start" align="center" gap="middle">
                            <Form layout="inline">
                                <Form.Item label="标题">
                                    <Input value={this.state.title} onChange={event=>this.setState({title: event.target.value})} placeholder='接口说明' />
                                </Form.Item>

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
                                disabled={ true }
                                defaultValue={ this.state.requestMethod }>
                                <Select.Option value={ REQUEST_METHOD_POST }>POST</Select.Option>
                                <Select.Option value={ REQUEST_METHOD_GET }>GET</Select.Option>
                            </Select>
                            <Input 
                                style={{borderRadius: 0}} 
                                prefix={ isStringEmpty(this.state.requestHost) ? "{{" + ENV_VALUE_API_HOST + "}}" : this.state.requestHost } 
                                disabled={ true }
                                value={ this.state.requestUri } 
                                size='large' />
                            <Button 
                                size='large' 
                                type="primary" 
                                style={{borderRadius: 0}} 
                                onClick={ this.handleSave }
                                >保存</Button>
                        </Flex>
                        <Tabs defaultActiveKey={ "body" } items={ this.getNavs() } />
                        <Divider orientation="left">响应</Divider>
                        <Flex>
                            <JsonSaveTableComponent readOnly={ false } object={this.state.formResponseData} cb={obj=>this.setState({formResponseData: obj})} />
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
        device : state.device,
    }
}
  
export default connect(mapStateToProps)(RequestSaveContainer);