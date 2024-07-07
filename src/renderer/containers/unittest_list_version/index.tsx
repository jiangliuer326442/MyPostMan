import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { 
    Breadcrumb, Layout, Flex, Dropdown,
    Popconfirm, Table, Space, Button, 
    Select, Form, message
} from "antd";
import type { MenuProps } from 'antd';
import { EditOutlined, DeleteOutlined, MoreOutlined, CarryOutOutlined } from '@ant-design/icons';

import { 
    TABLE_UNITTEST_FIELDS,
    TABLE_UNITTEST_STEPS_FIELDS,
    TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS,
} from '../../../config/db';
import {
    UNITTEST_RESULT_SUCCESS,
    UNITTEST_RESULT_FAILURE,
    UNITTEST_RESULT_UNKNOWN
} from '../../../config/unittest';
import {
    SHOW_ADD_UNITTEST_MODEL,
    SHOW_EDIT_UNITTEST_MODEL
} from '../../../config/redux';
import { getdayjs, isStringEmpty } from '../../util';
import { getEnvs } from '../../actions/env';
import {
    getUnitTests, 
    delUnitTest, 
    delUnitTestStep,
    executeUnitTest,
    continueExecuteUnitTest,
} from '../../actions/unittest';
import SingleUnitTestReport from '../../components/unittest/single_unittest_report';
import AddUnittestComponent from '../../components/unittest/add_unittest';

const { Header, Content, Footer } = Layout;

let unittest_uuid = TABLE_UNITTEST_FIELDS.FIELD_UUID;
let unittest_title = TABLE_UNITTEST_FIELDS.FIELD_TITLE;
let unittest_folder = TABLE_UNITTEST_FIELDS.FIELD_FOLD_NAME;
let unittest_uname = TABLE_UNITTEST_FIELDS.FIELD_CUNAME;
let unittest_ctime = TABLE_UNITTEST_FIELDS.FIELD_CTIME;

let unittest_step_unittest_uuid = TABLE_UNITTEST_STEPS_FIELDS.FIELD_UNITTEST_UUID;
let unittest_step_uuid = TABLE_UNITTEST_STEPS_FIELDS.FIELD_UUID;

let unittest_report_result = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_RESULT;
let unittest_report_env = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_ENV;
let unittest_report_step = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_STEP;
let unittest_report_batch = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_BATCH_UUID;
let unittest_report_cost_time = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_COST_TIME;

class UnittestListVersion extends Component {

    constructor(props) {
        super(props);
        let iteratorId = props.match.params.id;
        this.state = {
            executeFlg: true,
            column: [
                {
                  title: '测试用例',
                  dataIndex: unittest_title,
                  render: (title) => {
                    return title;
                  }
                },
                {
                    title: '执行结果',
                    dataIndex: unittest_report_result,
                    render: (result, record) => {
                        //整体
                        if (record[unittest_folder] !== undefined) {
                            if (result === undefined) {
                                return <span style={{color:"yellow"}}>未执行</span>;
                            } else if (result === UNITTEST_RESULT_SUCCESS) {
                                return <span style={{color:"green"}}>成功</span>;
                            } else if (result === UNITTEST_RESULT_FAILURE) {
                                return <span style={{color:"red"}}>失败</span>;
                            } else {
                                return <span style={{color:"yellow"}}>未知</span>;
                            }
                        } else {
                            if (result === undefined) {
                                return <span style={{color:"yellow"}}>未执行</span>;
                            } else if (result) {
                                return <span style={{color:"green"}}>成功</span>;
                            } else {
                                return <span style={{color:"red"}}>失败</span>;
                            }
                        }
                    }
                },
                {
                    title: '消耗时间',
                    dataIndex: unittest_report_cost_time,
                    render: (cost_time, record) => {
                        let result = record[unittest_report_result];
                        if (result === "success") {
                            return cost_time + "毫秒";
                        } else if (result) {
                            return "--";
                        }
                    }
                },
                {
                  title: '创建人',
                  dataIndex: unittest_uname,
                },
                {
                  title: '创建时间',
                  dataIndex: unittest_ctime,
                  render: (time) => { return getdayjs(time).format("YYYY-MM-DD") },
                },
                {
                    title: '操作',
                    dataIndex: 'operater',
                    render: (_, record) => {
                        //整体
                        if (record[unittest_folder] !== undefined) {
                            let unittestUuid = record[unittest_uuid];
                            return (
                                <Space>
                                    <Button disabled={!this.state.executeFlg} type="link" onClick={async ()=>{
                                        if (isStringEmpty(this.state.env)) {
                                            message.error("需要选择服务器环境");
                                            return;
                                        }
                                        this.setState({
                                            executeFlg: false,
                                            unittestUuid: "",
                                            batchUuid: "",
                                        })
                                        let batchUuid = await executeUnitTest(iteratorId, unittestUuid, record.children, this.state.env, this.props.dispatch);
                                        this.setState({ unittestUuid, batchUuid})
                                    }}>执行用例</Button>
                                    {record.result !== undefined ? 
                                    <Button type='link' href={ '#/unittest_executor_record/' + record[unittest_report_env] + '/' + iteratorId + '/' + unittestUuid }>执行记录</Button>
                                    : null}
                                    <Dropdown menu={this.getMore(record)}>
                                        <Button type="text" icon={<MoreOutlined />} />
                                    </Dropdown>
                                </Space>
                            );
                        } else {
                            //整体单测的 uuid
                            let valueUnittestStepUnittestUuid = record[unittest_step_unittest_uuid];
                            //当前步骤的 uuid
                            let valueUnittestStepUuid = record[unittest_step_uuid];
                            //报告中的下一步
                            let valueUnittestReportStep = record[unittest_report_step];
                            return (
                                <Space>
                                    {valueUnittestStepUuid === valueUnittestReportStep ? 
                                    <Button type="link" onClick={async ()=>{
                                        this.setState({
                                            executeFlg: false,
                                            unittestUuid: "",
                                            batchUuid: "",
                                        });

                                        let batchUuid = await continueExecuteUnitTest(iteratorId, valueUnittestStepUnittestUuid, record[unittest_report_batch], valueUnittestReportStep, record[unittest_report_env], this.props.dispatch);

                                        this.setState({
                                            unittestUuid: valueUnittestStepUnittestUuid,
                                            batchUuid,
                                        })
                                    }}>继续执行</Button>
                                    : null}
                                    <Button icon={<EditOutlined />} type='link' href={ "#/version_iterator_tests_step_edit/" + this.state.iteratorId + "/" + valueUnittestStepUnittestUuid + "/" + valueUnittestStepUuid } />
                                    <Popconfirm
                                        title="删除测试用例步骤"
                                        description="确定删除该步骤吗？"
                                        onConfirm={e => {
                                            delUnitTestStep(valueUnittestStepUuid, ()=>{
                                                getUnitTests(this.state.iteratorId, this.state.env, this.props.dispatch);
                                            });
                                        }}
                                        okText="删除"
                                        cancelText="取消">
                                        <Button danger type="link" icon={<DeleteOutlined />} />
                                    </Popconfirm>
                                </Space>
                            );
                        }
                    }
                },
            ],
            iteratorId,
            unittestUuid: "", 
            batchUuid: "",
            env: null
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        let nextIteratorId = nextProps.match.params.id;
        let prevIteratorId = prevState.iteratorId;
        if (nextIteratorId !== prevIteratorId) {
            return {
                iteratorId: nextIteratorId,
                unittestUuid: "",
                batchUuid: "",
            };
        }

        return null;
    }

    async componentDidMount(): void {
        if(this.props.envs.length === 0) {
            getEnvs(this.props.dispatch);
        }
        await getUnitTests(this.state.iteratorId, this.state.env, this.props.dispatch);
    }

    async componentDidUpdate(prevProps) {  
        if (this.props.match.params.id !== prevProps.match.params.id) { 
            await getUnitTests(this.state.iteratorId, this.state.env, this.props.dispatch);
        }
    }

    getMore = (record : any) : MenuProps => {
        if (record[unittest_folder] !== undefined) {
            return {'items': [{
                key: "1",
                label: <Button type="link" icon={<CarryOutOutlined />} href={ "#/version_iterator_tests_step_add/" + this.state.iteratorId + "/" + record[unittest_uuid] }>添加步骤</Button>
            },{
                key: "2",
                label: <Button type="link" icon={<EditOutlined />} onClick={()=>this.editUnitTestClick(record)}>编辑</Button>,
            },{
                key: "3",
                danger: true,
                label:  <Popconfirm
                            title="删除测试用例"
                            description="确定删除该测试用例吗？"
                            onConfirm={e => {
                                delUnitTest(record, ()=>{
                                    getUnitTests(this.state.iteratorId, this.state.env, this.props.dispatch);
                                });
                            }}
                            okText="删除"
                            cancelText="取消"
                            >
                            <Button danger type="link" icon={<DeleteOutlined />}>删除</Button>
                        </Popconfirm>,
            }]};
        } else {
            return {'items': [] };
        }
    }

    setEnvironmentChange = (value: string) => {
        this.setState({env: value});
        getUnitTests(this.state.iteratorId, value, this.props.dispatch);
    }

    editUnitTestClick = (record) => {
        this.props.dispatch({
            type: SHOW_EDIT_UNITTEST_MODEL,
            iteratorId: this.state.iteratorId,
            unitTestUuid: record[unittest_uuid],
            title: record[unittest_title],
            folder: record[unittest_folder],
            open: true
        });
    }

    addUnitTestClick = () => {
        this.props.dispatch({
            type: SHOW_ADD_UNITTEST_MODEL,
            iteratorId: this.state.iteratorId,
            unitTestUuid: "",
            open: true
        });
    }

    render() : ReactNode {
        return (
            <Layout>
                <Header style={{ padding: 0 }}>
                    迭代单测列表
                </Header>
                <Content style={{ margin: '0 16px' }}>
                    <Breadcrumb style={{ margin: '16px 0' }} items={[
                        { title: '迭代' }, 
                        { title: '单测列表' }
                    ]} />
                    <Flex justify="space-between" align="center">
                        <Form layout="inline">
                            <Form.Item label="选择环境">
                                <Select
                                    value={ this.state.env }
                                    onChange={this.setEnvironmentChange}
                                    style={{ width: 120 }}
                                    options={this.props.envs.map(item => {
                                        return {value: item.label, label: item.remark}
                                    })}
                                />
                            </Form.Item>
                        </Form>
                        <Button style={{ margin: '16px 0' }} type="primary" onClick={this.addUnitTestClick}>添加单测</Button>
                        <AddUnittestComponent />
                    </Flex>
                    <SingleUnitTestReport 
                        iteratorId={ this.state.iteratorId }
                        unittestUuid={ this.state.unittestUuid }
                        batchUuid={ this.state.batchUuid }
                        cb={ () => {
                            this.setState({executeFlg: true});
                            getUnitTests(this.state.iteratorId, this.state.env, this.props.dispatch);
                        } }
                        />
                    <Table columns={this.state.column} dataSource={this.props.unittest[this.state.iteratorId] ? this.props.unittest[this.state.iteratorId] : []} />
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                    MyPostMan ©{new Date().getFullYear()} Created by 方海亮
                </Footer>
            </Layout>
        )
    }

}

function mapStateToProps (state) {
    return {
        unittest: state.unittest.list,
        envs: state.env.list,
    }
}
      
export default connect(mapStateToProps)(UnittestListVersion);