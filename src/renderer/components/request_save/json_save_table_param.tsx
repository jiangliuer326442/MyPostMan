import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { cloneDeep } from 'lodash';
import { Table, Input, Modal, Form, Checkbox, Button, Space } from "antd";
import { MinusOutlined } from "@ant-design/icons";

import {
    TABLE_FIELD_NAME,
    TABLE_FIELD_TYPE,
    TABLE_FIELD_NECESSARY,
    TABLE_FIELD_VALUE,
    TABLE_FIELD_REMARK,
    parseJsonToChildren,
    parseJsonToTable,
} from '../../util/json';

class JsonSaveParamTableContainer extends Component {

    constructor(props) {
        super(props);
        this.state = {
            open: false,
            addKey: "",
            addVal: "",
            object: props.object,
            columns: [
                {
                    title: '参数名',
                    dataIndex: TABLE_FIELD_NAME,
                },
                {
                    title: '参数类型',
                    dataIndex: TABLE_FIELD_TYPE,
                },
                {
                    title: '必填',
                    dataIndex: TABLE_FIELD_NECESSARY,
                    render: (necessary : number|undefined, row : any) => {
                        let key = row.key;
                        return <Checkbox checked={necessary == 1} onChange={event=> this.handleSetNecessary(key, event.target.checked) }></Checkbox>;
                    }
                },
                {
                    title: '备注',
                    dataIndex: TABLE_FIELD_REMARK,
                    render: (remark : any, row : any) => {
                        let key = row.key;
                        let obj = this.state.object[key];
                        if (obj === undefined) {
                            return <Input defaultValue="" value="" onChange={ event => this.handleSetRemark(key, event.target.value) } />;
                        }
                        return <Input defaultValue={ remark } value={ obj[TABLE_FIELD_REMARK] } onChange={ event => this.handleSetRemark(key, event.target.value) } />;
                    }
                },
                {
                    title: '示例',
                    dataIndex: TABLE_FIELD_VALUE,
                    render: (demoRaw : any, row : any) => {
                        let key = row.key;
                        let demo = cloneDeep(demoRaw);
                        if (this.props.readOnly) {
                            if(demo != null && demo.length > 50) {
                                return demo.substring(0, 50) + "...";
                            }
                            return demo;
                        } else {
                            return <Input value={demo} onChange={ event => this.handleSetValue(key, event.target.value) } />
                        }
                    }
                },
            ],
            datas: [],
            rawJson: {},
        }

        if (!this.props.readOnly) {
            this.state.columns.unshift(                {
                title: '操作',
                dataIndex: 'operator',
                render: (_, row : any) => {
                    return <Button onClick={ () => this.handleDelKey(row.key) } icon={<MinusOutlined />} />
                }
            });
        }
    }

    async componentDidMount() {
        this.parseJsonToChildren();
    }

    parseJsonToChildren = async () => {
        let parseJsonToChildrenResult : Array<any> = [];
        await parseJsonToChildren([], "", parseJsonToChildrenResult, this.state.object, async (parentKey, content) => undefined);
        this.setState({ datas : parseJsonToChildrenResult })
    }

    handleSetNecessary = (key, checked) => {
        let obj = this.state.object;
        if (checked) {
            obj[key][TABLE_FIELD_NECESSARY] = 1;
        } else {
            obj[key][TABLE_FIELD_NECESSARY] = 0;
        }
        this.props.cb(this.state.object);

        this.parseJsonToChildren();
    }

    handleSetRemark = (key, value) => {
        let obj = this.state.object[key];
        obj[TABLE_FIELD_REMARK] = value;
        this.props.cb(this.state.object);

        let returnObject = cloneDeep(this.state.object);
        this.setState({object: returnObject});
    }

    handleSetValue = (key, value) => {
        let obj = this.state.object[key];
        obj[TABLE_FIELD_VALUE] = value;
        this.props.cb(this.state.object);

        this.parseJsonToChildren();
    }

    handleDelKey = (key : string) => {
        let rawJson = this.state.rawJson;
        delete rawJson[key];
        delete this.state.object[key];
        this.props.cb(this.state.object);
        this.parseJsonToChildren();
    }
    handleAddKey = () => {
        let rawJson = this.state.rawJson;
        let addKey = this.state.addKey;
        let addVal = this.state.addVal;
        rawJson[addKey] = addVal;
        parseJsonToTable(this.state.object, rawJson);
        this.parseJsonToChildren();
        this.props.cb(this.state.object);

        this.cleanPop();
    }

    handleCancel = () => {
        this.cleanPop();
    }

    cleanPop = () => {
        this.setState({
            open: false,
            addKey: "",
            addVal: "",
        });
    }

    render() : ReactNode {
        return (
            <Space direction="vertical" size={"small"} style={{width: "100%"}}>
                {!this.props.readOnly ? 
                <>
                    <Button onClick={() => this.setState({open: true})}>新增一行</Button>
                    <Modal
                        title="添加Param"
                        open={this.state.open}
                        onOk={this.handleAddKey}
                        onCancel={this.handleCancel}
                        width={230}
                    >
                        <Form
                            layout="vertical"
                        >
                            <Form.Item>
                                <Input placeholder="key" value={this.state.addKey} onChange={ event=>this.setState({addKey : event.target.value}) } />
                            </Form.Item>
                            <Form.Item>
                                <Input placeholder="value" value={this.state.addVal} onChange={ event=>this.setState({addVal : event.target.value}) } />
                            </Form.Item>
                        </Form>
                    </Modal>
                </>
                : null}
                <Table
                    style={{width : "100%"}}
                    columns={this.state.columns}
                    dataSource={this.state.datas}
                    pagination={ false }
                />
            </Space>
        )
    }
}

function mapStateToProps (state) {
    return {
    }
}
  
export default connect(mapStateToProps)(JsonSaveParamTableContainer);