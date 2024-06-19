import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import JsonView from 'react-json-view';
import { Descriptions } from "antd";
import type { DescriptionsProps } from 'antd';
import { cloneDeep } from 'lodash';

import { getdayjs, isStringEmpty } from '../../util';
import {
    REQUEST_METHOD_GET,
    REQUEST_METHOD_POST
} from '../../../config/global_config';
import {
    TABLE_UNITTEST_FIELDS,
    TABLE_ENV_FIELDS,
    TABLE_UNITTEST_STEPS_FIELDS,
    TABLE_UNITTEST_STEP_ASSERT_FIELDS,
    TABLE_UNITTEST_EXECUTOR_FIELDS,
    TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS,
} from '../../../config/db';
import {
    getSingleExecutorReport,
    getSingleExecutorStep,
    getUnitTestStepAsserts,
} from '../../actions/unittest';

let unittest_uuid = TABLE_UNITTEST_FIELDS.FIELD_UUID;
let unittest_title = TABLE_UNITTEST_FIELDS.FIELD_TITLE;

let env_label = TABLE_ENV_FIELDS.FIELD_LABEL;
let env_remark = TABLE_ENV_FIELDS.FIELD_REMARK;

let unittest_step_uuid = TABLE_UNITTEST_STEPS_FIELDS.FIELD_UUID;
let unittest_step_title = TABLE_UNITTEST_STEPS_FIELDS.FIELD_TITLE;
let unittest_step_sort = TABLE_UNITTEST_STEPS_FIELDS.FIELD_SORT;
let unittest_step_request_method = TABLE_UNITTEST_STEPS_FIELDS.FIELD_REQUEST_METHOD;

let unittest_step_assert_title = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_TITLE;
let unittest_step_assert_left = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_ASSERT_LEFT;
let unittest_step_assert_operator = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_ASSERT_OPERATOR;
let unittest_step_assert_right = TABLE_UNITTEST_STEP_ASSERT_FIELDS.FIELD_ASSERT_RIGHT;

let unittest_executor_delFlg = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_DELFLG;
let unittest_executor_param = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_REQUEST_PARAM;
let unittest_executor_body = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_REQUEST_BODY;
let unittest_executor_cost_time = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_COST_TIME;
let unittest_executor_response = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_REQUEST_RESPONSE;
let unittest_executor_assert_left = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_ASSERT_LEFT;
let unittest_executor_assert_right = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_ASSERT_RIGHT;
let unittest_executor_result = TABLE_UNITTEST_EXECUTOR_FIELDS.FIELD_RESULT;

let unittest_report_env = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_ENV;
let unittest_report_result = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_RESULT;
let unittest_report_cost_time = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_COST_TIME;
let unittest_report_failure_reason = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_REASON;
let unittest_report_ctime = TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS.FIELD_CTIME;

class SingleUnitTestReport extends Component {

    constructor(props) {
        super(props);

        this.state = {
            recentUnittestUuid: "",
            recentBatchUuid: "",
            recentUnitTestReport: {},
            recentStepResult: [],
            openFlg: false
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (isStringEmpty(nextProps.batchUuid)) {
            return {
                recentUnittestUuid: "",
                recentBatchUuid: "",
                recentUnitTestReport: {},
                recentStepResult: [],
                openFlg: false
            }
        }
        return null;
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.batchUuid !== prevProps.batchUuid) {
            this.buildRecentExecutorResult(this.props.iteratorId, this.props.unittestUuid, this.props.batchUuid);
        }
    }

    getDescriptions = () : DescriptionsProps['items'] => {
        let selectedUnitTest = this.props.unittest[this.props.iteratorId].find(row => row[unittest_uuid] === this.state.recentUnittestUuid);
        let selectedEnv = this.props.envs.find(row => row[env_label] === this.state.recentUnitTestReport[unittest_report_env]);
        return [
            {
                key: '1',
                label: '测试用例',
                children: selectedUnitTest[unittest_title],
            },
            {
                key: '2',
                label: '运行环境',
                children: selectedEnv[env_remark],
            },
            {
                key: '3',
                label: '执行结果',
                children: this.state.recentUnitTestReport[unittest_report_result] ? <span style={{color:"green"}}>成功</span> : <span style={{color:"red"}}>失败</span>,
            },
            {
                key: '4',
                label: '接口耗时',
                children: this.state.recentUnitTestReport[unittest_report_cost_time] + "毫秒",
            },
            {
                key: '5',
                label: '错误信息',
                children: this.state.recentUnitTestReport[unittest_report_result] ? "--" : this.state.recentUnitTestReport[unittest_report_failure_reason],
            },
            {
                key: '6',
                label: '执行时间',
                children: getdayjs(this.state.recentUnitTestReport[unittest_report_ctime]).format("YYYY-MM-DD HH:mm:ss"),
            },
        ];
    }

    buildRecentExecutorResult = async (iteratorId: string, unittestUuid : string, batchUuid : string) => {
        //单测报告
        let unitTestReport = await getSingleExecutorReport(iteratorId, unittestUuid, batchUuid);
        let steps = cloneDeep(this.props.unittest[iteratorId].find(row => row[unittest_uuid] === unittestUuid)?.children);
        if (steps === undefined) steps = [];
        let stepExecutorResult = [];
        for (let _step of steps) {
            let stepUuid = _step[unittest_step_uuid];

            let stepTitle = _step[unittest_step_title];
            let stepSort = _step[unittest_step_sort];
            let method = _step[unittest_step_request_method];
            let unitTestAsserts = await getUnitTestStepAsserts(iteratorId, unittestUuid, stepUuid);

            let singleExecutorStep = await getSingleExecutorStep(iteratorId, unittestUuid, batchUuid, stepUuid);
            if (singleExecutorStep !== undefined && singleExecutorStep[unittest_executor_delFlg] === 0) {
                let data = {};
                let response = singleExecutorStep[unittest_executor_response];
                let assertResult = singleExecutorStep[unittest_executor_result];
                let costTime = singleExecutorStep[unittest_executor_cost_time];
                if (method === REQUEST_METHOD_POST) {
                    data = singleExecutorStep[unittest_executor_body];
                } else if (method === REQUEST_METHOD_GET) {
                    data = singleExecutorStep[unittest_executor_param];
                }
                let assertLeftArr = singleExecutorStep[unittest_executor_assert_left];
                let assertRightArr = singleExecutorStep[unittest_executor_assert_right];
                let stepExecutorItem : any = {};
                stepExecutorItem.key = stepUuid;
                stepExecutorItem.title = stepTitle;
                stepExecutorItem.sort = stepSort;
                stepExecutorItem.input = data;
                stepExecutorItem.output = response;
                stepExecutorItem.assertArr = unitTestAsserts;
                stepExecutorItem.assertLeftArr = assertLeftArr;
                stepExecutorItem.assertRightArr = assertRightArr;
                stepExecutorItem.assertResult = assertResult;
                stepExecutorItem.costTime = costTime;
                stepExecutorResult.push(stepExecutorItem);
            }
        }

        this.setState({
            recentUnittestUuid: unittestUuid,
            recentBatchUuid: batchUuid,
            recentStepResult: stepExecutorResult,
            openFlg: true, 
            recentUnitTestReport: unitTestReport,
        });

        this.props.cb();
    }

    render() : ReactNode {
        return (this.state.openFlg ? 
            <>
                <Descriptions title="最近一次测试用例执行结果：" items={this.getDescriptions()} />
                {this.state.recentStepResult.map((item, index) => {
                    const items: DescriptionsProps['items'] = [
                        {
                            key: '1',
                            label: '流入',
                            children: <JsonView 
                                src={item.input}   
                                name="response"
                                theme={ "bright" }
                                collapsed={false}  
                                indentWidth={4}  
                                iconStyle="triangle"
                                enableClipboard={true}
                                displayObjectSize={false}
                                displayDataTypes={false}
                                collapseStringsAfterLength={40}  />,
                        },
                        {
                            key: '2',
                            label: '流出',
                            children: <JsonView 
                                src={item.output}   
                                name="response"
                                theme={ "bright" }
                                collapsed={true}  
                                indentWidth={4}  
                                iconStyle="triangle"
                                enableClipboard={true}
                                displayObjectSize={false}
                                displayDataTypes={false}
                                collapseStringsAfterLength={40}  />,
                        },
                        {
                            key: '3',
                            label: '结果',
                            children: item.assertResult ? <span style={{color:"green"}}>成功</span> : <span style={{color:"red"}}>失败</span>,
                        },
                        {
                            key: '4',
                            label: '耗时',
                            children: item.assertResult ? item.costTime + " 毫秒" : " -- ",
                        },
                    ];
                    for (let _index in item.assertArr) {
                        let assertLeft = item.assertLeftArr[_index];
                        if (typeof assertLeft === "number") {
                            assertLeft = assertLeft.toString(); 
                        }
                        if (isStringEmpty(assertLeft)) continue;
                        let _indexNumber = Number(_index) + 1;
                        items.push({
                            key : 50 + _index,
                            label: "断言" + _indexNumber + "：",
                            children: "[" + item.assertArr[_index][unittest_step_assert_operator] + "] " + item.assertArr[_index][unittest_step_assert_title],
                        });
                        items.push({
                            key : 51 + _index,
                            label: "操作符👈：",
                            children: item.assertArr[_index][unittest_step_assert_left] + " -> " + item.assertLeftArr[_index],
                        });
                        items.push({
                            key : 52 + _index,
                            label: "操作符👉：",
                            children: item.assertArr[_index][unittest_step_assert_right] + " -> " + item.assertRightArr[_index] 
                        });
                    }
                    return (<Descriptions key={item.key} column={1}  title={"步骤 " + item.sort + " ：" + item.title} items={items} />)
                })}
            </>
        : null)
    }
}

function mapStateToProps (state) {
    return {
        unittest: state.unittest.list,
        envs: state.env.list,
    }
}
      
export default connect(mapStateToProps)(SingleUnitTestReport);