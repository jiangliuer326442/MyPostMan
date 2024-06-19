import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Breadcrumb, Layout, Flex, FloatButton, Collapse, Popconfirm, InputNumber, Descriptions, Form, Tooltip, Select, Divider, Table, message, Input, Space, Button } from "antd";
import { EyeOutlined, DeleteOutlined, FileTextOutlined } from '@ant-design/icons';
import type { FormProps } from 'antd';
// import * as Showdown from 'showdown';
import { encode } from 'base-64';

import { 
    TABLE_VERSION_ITERATION_REQUEST_FIELDS, 
    TABLE_VERSION_ITERATION_FIELDS, 
    TABLE_MICRO_SERVICE_FIELDS 
} from '../../../config/db';
import { getdayjs, isStringEmpty } from '../../util';
import MarkdownView from '../../components/markdown/show';
import { getPrjs } from '../../actions/project';
import { getVersionIterator } from '../../actions/version_iterator';
import { 
    getVersionIteratorFolders, 
    delVersionIteratorFolder 
} from '../../actions/version_iterator_folders';
import { 
    getVersionIteratorRequestsByProject, 
    delVersionIteratorRequest, 
    setVersionIterationRequestSort 
} from '../../actions/version_iterator_requests';

const { Header, Content, Footer } = Layout;

type FieldType = {
    prj?: string;
    folder?: string,
    title?: string;
    uri?: string;
};

let version_iterator_title = TABLE_VERSION_ITERATION_FIELDS.FIELD_NAME;
let iteration_request_sort = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_SORT;
let version_iterator_uname = TABLE_VERSION_ITERATION_FIELDS.FIELD_CUNAME;
let version_iterator_prjs = TABLE_VERSION_ITERATION_FIELDS.FIELD_PROJECTS;
let version_iterator_content = TABLE_VERSION_ITERATION_FIELDS.FIELD_CONTENT;
let version_iterator_openflg = TABLE_VERSION_ITERATION_FIELDS.FIELD_OPENFLG;
let version_iterator_ctime = TABLE_VERSION_ITERATION_FIELDS.FIELD_CTIME;

let iteration_request_fold = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_FOLD;
let iteration_request_prj = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_MICRO_SERVICE_LABEL;
let iteration_request_method = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_METHOD;
let iteration_request_uri = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_URI;
let iteration_request_title = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_TITLE;

let prj_label = TABLE_MICRO_SERVICE_FIELDS.FIELD_LABEL;
let prj_remark = TABLE_MICRO_SERVICE_FIELDS.FIELD_REMARK;

class RequestListVersion extends Component {

    constructor(props) {
        super(props);
        let iteratorId = this.props.match.params.id;
        this.state = {
            iteratorId,
            versionIteration: {},
            requestsJsxDividered: {},
            listColumn: [
                {
                    title: '接口地址',
                    dataIndex: iteration_request_uri,
                    render: (uri) => { 
                        if (uri.length > 25) {
                            return <Tooltip title={ uri } placement='right'>
                                {"..." + uri.substring(uri.length - 25, uri.length)}
                                </Tooltip>;
                        } else {
                            return uri;
                        }
                    }
                },
                {
                    title: '接口说明',
                    dataIndex: iteration_request_title,
                },
                {
                    title: '排序',
                    dataIndex: iteration_request_sort,
                    render: (sort, record) => {
                        let prj = record[iteration_request_prj];
                        let method = record[iteration_request_method];
                        let uri = record[iteration_request_uri];
                        if (sort === undefined) {
                            return <InputNumber style={{width: 65}} value={0} onBlur={event => this.setApiSort(prj, method, uri, event.target.value)} />;
                        } else {
                            return <InputNumber style={{width: 65}} value={sort} onBlur={event => this.setApiSort(prj, method, uri, event.target.value)} />;
                        }
                    }
                },
                {
                    title: '操作',
                    key: 'operater',
                    render: (_, record) => {
                        let urlStr = encode(this.state.iteratorId + "$$" + record[iteration_request_prj] + "$$" + record[iteration_request_method] + "$$" + record[iteration_request_uri]);
                        let url = "#/version_iterator_request/" + urlStr;
                        return (
                            <Space size="middle">
                                <Button type="link" icon={<EyeOutlined />} href={ url } />
                                { this.state.versionIteration[version_iterator_openflg] === 1 ? 
                                <Popconfirm
                                    title="删除api"
                                    description="确定删除该 api 吗？"
                                    onConfirm={e => {
                                        delVersionIteratorRequest(record, ()=>{
                                            this.onFinish({});
                                        });
                                    }}
                                    okText="确定"
                                    cancelText="取消"
                                >
                                    <Button danger type="link" icon={<DeleteOutlined />} />
                                </Popconfirm>
                                : null}
                            </Space>
                        );
                    },
                }
            ],
            formReadyFlg: false,
            folders: [],
            prj: "",
            folder: null,
        }
    }

    async componentWillReceiveProps(nextProps) {
        let iteratorId = nextProps.match.params.id;
        if (this.state.iteratorId !== iteratorId) {
            let versionIteration = await getVersionIterator(iteratorId);
            this.setState( { iteratorId, versionIteration }, () => this.onFinish({}) );
        }
    }

    componentDidMount() {
        if(this.props.prjs.length === 0) {
            getPrjs(this.props.dispatch);
        }
        this.onFinish({});
        getVersionIterator(this.state.iteratorId).then(versionIteration => this.setState( { versionIteration, formReadyFlg : true } ));
    }

    setApiSort = async (prj : string, method : string, uri : string, sort : number) => {
        setVersionIterationRequestSort(this.state.iteratorId, prj, method, uri, sort, () => {
            this.onFinish({
                prj: this.state.prj,
                folder: this.state.folder,
            });
        });
    }

    onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
        let prj = values.prj;
        let title = values.title;
        let uri = values.uri;
        let folder = values.folder;
        let version_iteration_requests = await getVersionIteratorRequestsByProject(this.state.iteratorId, prj, folder, title, uri);
        let requestsDividered = {};
        let requestsJsxDividered = {};
        
        for(let version_iteration_request of version_iteration_requests ) {
            version_iteration_request.key = version_iteration_request[iteration_request_method] + version_iteration_request[iteration_request_uri];
            let prj = version_iteration_request[iteration_request_prj];
            if (!(prj in requestsDividered)) {
                requestsDividered[prj] = {};
                requestsJsxDividered[prj] = [];
            }
            let fold = version_iteration_request[iteration_request_fold];
            if (!(fold in requestsDividered[prj])) {
                requestsDividered[prj][fold] = [];

                let foldJsx = {};
                foldJsx.key = fold;
                foldJsx.label = "/" + fold;
                foldJsx.children = (<Table 
                    dataSource={requestsDividered[prj][fold]} 
                    columns={this.state.listColumn} 
                />);
                foldJsx.extra = ((!isStringEmpty(fold) && this.state.versionIteration[version_iterator_openflg] === 1) ? (
                <DeleteOutlined onClick={event => {
                    delVersionIteratorFolder(this.state.iteratorId, prj, fold, ()=>{
                        message.success("删除文件夹成功");
                        getVersionIteratorFolders(this.state.iteratorId, prj, this.props.dispatch, () => {
                            this.onFinish({});
                        });
                    });
                    event.stopPropagation();
                }} />) : null);

                requestsJsxDividered[prj].push(foldJsx);
            }
            requestsDividered[prj][fold].push(version_iteration_request);
        }
        for (let _prj in requestsJsxDividered) {
            for (let requestJsxDividered of requestsJsxDividered[_prj]) {
                let fold = requestJsxDividered.key;
                requestJsxDividered.label = "/" + fold + "（" + requestsDividered[_prj][fold].length + "）";
            }
        }
        this.setState({
            requestsJsxDividered,
            prj,
            folder,
        });
    }

    render() : ReactNode {
        return (
            <Layout>
                <Header style={{ padding: 0 }}>
                    迭代接口列表
                </Header>
                {this.state.formReadyFlg ?
                <Content style={{ margin: '0 16px' }}>
                    <Breadcrumb style={{ margin: '16px 0' }} items={[
                        { title: '迭代' }, 
                        { title: '接口列表' }
                    ]} />
                    <Flex vertical gap="middle">
                        <Flex>
                            <Descriptions column={2} title="迭代信息" items={ [
                                {
                                    key: version_iterator_title,
                                    label: '迭代名称',
                                    children: this.state.versionIteration[version_iterator_title],
                                },
                                {
                                    key: version_iterator_openflg,
                                    label: '迭代状态',
                                    children: this.state.versionIteration[version_iterator_openflg] === 1 ? "进行中" : "已结束",
                                },
                                {
                                    key: version_iterator_uname,
                                    label: '创建人',
                                    children: this.state.versionIteration[version_iterator_uname],
                                },
                                {
                                    key: version_iterator_ctime,
                                    label: '创建时间',
                                    children: getdayjs(this.state.versionIteration[version_iterator_ctime]).format("YYYY-MM-DD"),
                                },
                                ] } />
                        </Flex>
                        <Flex justify="flex-start" align="center" gap="middle">
                            <Form 
                                layout="inline"
                                onFinish={ this.onFinish } 
                                initialValues={ { prj: this.state.prj } }
                                autoComplete="off"
                            >
                                <Form.Item<FieldType> style={{paddingBottom: 20}} label="接口地址" name="uri" rules={[{ required: false }]}>
                                    <Input />
                                </Form.Item>

                                <Form.Item<FieldType> label="接口说明" name="title" rules={[{ required: false }]}>
                                    <Input />
                                </Form.Item>

                                <Form.Item<FieldType> label="选择项目" name="prj" rules={[{ required:  false }]}>
                                    <Select
                                        style={{ width: 180 }}
                                        options={this.state.versionIteration[version_iterator_prjs].map(item => {
                                            return {value: item, label: this.props.prjs.find(row => row[prj_label] === item) ? this.props.prjs.find(row => row[prj_label] === item)[prj_remark] : ""}
                                        })}
                                        onChange={ value => {
                                            getVersionIteratorFolders(this.state.iteratorId, value, folders => {
                                                this.setState({ folders });
                                            });
                                        } }
                                    />
                                </Form.Item>                           

                                <Form.Item<FieldType> label="选择文件夹" name="folder" rules={[{ required:  false }]}>
                                    <Select
                                        style={{ width: 180 }}
                                        options={ this.state.folders }
                                    />
                                </Form.Item>

                                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                                    <Button type="primary" htmlType="submit">
                                        搜索
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Flex>
                        {Object.keys(this.state.requestsJsxDividered).map(prj => (
                            <Flex vertical key={prj}>
                                <Divider orientation="left">
                                    <p>{ "项目：" + (this.props.prjs.length > 0 ? this.props.prjs.find(row => row[prj_label] === prj)[prj_remark] : "") }</p >
                                </Divider>
                                <Collapse items={this.state.requestsJsxDividered[prj]} />
                            </Flex>
                        ))}
                        <Flex vertical gap={"middle"}>
                            <Flex>
                                <Divider>迭代说明</Divider>
                            </Flex>
                            <MarkdownView showNav={ true } content={ this.state.versionIteration[version_iterator_content] } show={ this.state.formReadyFlg } />
                        </Flex> 
                    </Flex>
                    <FloatButton 
                        icon={<FileTextOutlined />}
                        description="迭代文档"
                        shape="square"
                        style={{right: 24, width: 60}}
                        onClick={() => window.location.href = "#/version_iterator_doc/" + this.state.iteratorId} />
                </Content>
                : null}
                <Footer style={{ textAlign: 'center' }}>
                    MyPostMan ©{new Date().getFullYear()} Created by 方海亮
                </Footer>
            </Layout>
        );
    }
}
    
function mapStateToProps (state) {
    return {
        prjs: state.prj.list
    }
}
      
export default connect(mapStateToProps)(RequestListVersion);