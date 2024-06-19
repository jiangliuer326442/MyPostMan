import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { 
    Breadcrumb, Layout, Flex, Form, Tooltip,
    Input, Button, DatePicker, Table, Space
} from "antd";
import { 
    EyeOutlined,  
    DeleteOutlined 
} from '@ant-design/icons';
import type { GetProps, FormProps } from 'antd';
import JsonView from 'react-json-view';

import { 
    getNowdayjs,
    getdayjs,
    isStringEmpty, 
} from '../../util';
import {
    prettyJson,
    retShortJsonContent,
} from '../../util/json'
import { 
    TABLE_REQUEST_HISTORY_FIELDS,
} from '../../../config/db';
import { 
    delRequestHistory,
    getRequestHistorys 
} from "../../actions/request_history";
import SelectPrjEnvComponent from "../../components/env_var/select_prj_env";

type RangePickerProps = GetProps<typeof DatePicker.RangePicker>;
const { Header, Content, Footer } = Layout;
const { RangePicker } = DatePicker;

type FieldType = {
    uri?: string;
    btime?: number;
    etime?: number;
};

let id = TABLE_REQUEST_HISTORY_FIELDS.FIELD_ID;
let method = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_METHOD;
let uri = TABLE_REQUEST_HISTORY_FIELDS.FIELD_URI;
let body = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_BODY;
let param = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_PARAM;
let response = TABLE_REQUEST_HISTORY_FIELDS.FIELD_RESPONSE_CONTENT;
let ctime = TABLE_REQUEST_HISTORY_FIELDS.FIELD_CTIME;

class RequestHistoryContainer extends Component {

    constructor(props) {
      super(props);
      this.state = {
        id: 0,
        list: [],
        loadDataFlg: false,
        prj : "",
        env : "",
        uri : "",
        btime: getNowdayjs().subtract(1, 'day').valueOf(),
        etime: getNowdayjs().valueOf(),
      }
    }

    getEnvValueData = (prj: string, env: string) => {
        if(!(isStringEmpty(prj) || isStringEmpty(env))) {
            if (!this.state.loadDataFlg) {
                getRequestHistorys(env, prj, this.state.btime, this.state.etime, "", list => {
                    let datas = [];
                    list.map(item => {
                        item.key = item[id];
                        datas.push(item);
                    });
                    this.setState({list: datas});
                });
            }
            this.setState({
                loadDataFlg: true,
                prj,
                env,
            });
        }
    }

    onFinish: FormProps<FieldType>['onFinish'] = (values) => {
        getRequestHistorys(this.state.env, this.state.prj, this.state.btime, this.state.etime, values.uri, list => {
            let datas = [];
            list.map(item => {
                item.key = item[id];
                datas.push(item);
            });
            this.setState({list: datas, uri: values.uri});
        });
    }

    handleDel = (record) => {
        delRequestHistory(record, ()=>{
            getRequestHistorys(this.state.env, this.state.prj, this.state.btime, this.state.etime, this.state.uri, list => {
                let datas = [];
                list.map(item => {
                    item.key = item[id];
                    datas.push(item);
                });
                console.debug(datas);
                this.setState({list: datas});
            });
        });
    }

    listColumn = () => {
        return [
            {
                title: '地址',
                dataIndex: "url",
                width: 240,
                render: (_, record) => { 
                    return <Tooltip title={record[uri]} placement='right'>
                        { record[method] + "\n" + (record[uri].length > 25 ? "..." + record[uri].substring(record[uri].length - 25, record[uri].length) : record[uri]) }
                    </Tooltip>
                },
            },
            {
                title: '数据',
                dataIndex: "datas",
                width: 240,
                render: (_, record) => {
                    return <JsonView 
                        src={record[body]}   
                        name="response"
                        theme={ "bright" }
                        collapsed={false}  
                        indentWidth={4}  
                        iconStyle="triangle"
                        enableClipboard={true}
                        displayObjectSize={false}
                        displayDataTypes={false}
                        collapseStringsAfterLength={40}  />;
                },
            },
            {
                title: '响应',
                dataIndex: response,
                render: (content) => { 
                    return <JsonView 
                    src={JSON.parse(content)}   
                    name="response"
                    theme={ "bright" }
                    collapsed={true}  
                    indentWidth={4}  
                    iconStyle="triangle"
                    enableClipboard={true}
                    displayObjectSize={false}
                    displayDataTypes={false}
                    collapseStringsAfterLength={40}  />
                },
            },
            {
                  title: '时间',
                  witdh: 60,
                  dataIndex: ctime,
                  render: (time) => { return getdayjs(time).format("MM-DD HH:mm")},
            },
            {
                title: '操作',
                key: 'operater',
                width: 40,
                render: (_, record) => {
                  return (
                    <Space>
                        <Button type="link" href={ "#/internet_request_send_by_history/" + record[id] } icon={<EyeOutlined />} />
                        <Button danger type="link" icon={<DeleteOutlined />} onClick={()=>this.handleDel(record)} />
                    </Space>
                  )
                },
              }
        ];
    }

    render() : ReactNode {
        return (
            <Layout>
                <Header style={{ padding: 0 }}>
                    网络请求记录
                </Header>
                <Content style={{ margin: '0 16px' }}>
                    <Breadcrumb style={{ margin: '16px 0' }} items={[{ title: '请求' }, { title: '历史' }]}></Breadcrumb>
                    <Flex vertical gap="middle">
                        <Flex justify="space-between" align="center">
                            <SelectPrjEnvComponent prj={ this.state.prj ? this.state.prj : this.props.prj } env={ this.state.env ? this.state.env : this.props.env } cb={this.getEnvValueData} />
                        </Flex>
                        <Flex>
                            <Form layout='inline' onFinish={ this.onFinish } autoComplete="off">
                                <Form.Item<FieldType>
                                    label="接口 uri"
                                    name="uri"
                                    rules={[{ required: false }]}
                                >
                                    <Input />
                                </Form.Item>

                                <RangePicker
                                    showTime={{ format: 'HH:mm' }}
                                    format="YYYY-MM-DD HH:mm"
                                    defaultValue={[getdayjs(this.state.btime), getdayjs(this.state.etime)]}
                                    onChange={(value, dateString) => {
                                        this.setState({btime: value[0]?.valueOf(), etime: value[1]?.valueOf()});
                                    } }
                                />

                                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                                    <Button type="primary" htmlType="submit">
                                        搜索
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Flex>
                        
                        <Table dataSource={this.state.list} columns={this.listColumn()} />
                    </Flex>
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
        prj: state.env_var.prj,
        env: state.env_var.env,
    }
  }
  
  export default connect(mapStateToProps)(RequestHistoryContainer);
                