import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { 
  Breadcrumb, Layout, Form, Select,
  Flex, Space, Button, Popconfirm, Table
} from "antd";
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { cloneDeep } from 'lodash';

import { isStringEmpty } from '../../util';
import { TABLE_ENV_VAR_FIELDS, TABLE_MICRO_SERVICE_FIELDS } from '../../../config/db';
import { ENV_VALUE_API_HOST } from '../../../config/envKeys';
import { ENV_LIST_ROUTE } from '../../../config/routers';
import { SHOW_ADD_PROPERTY_MODEL, SHOW_EDIT_PROPERTY_MODEL } from '../../../config/redux';
import { getEnvs } from '../../actions/env';
import { addEnvValues, getEnvValues, delEnvValue } from '../../actions/env_value';
import RequestSendTips from '../../classes/RequestSendTips';
import AddEnvVarComponent from '../../components/env_var/add_env_var';

const { Header, Content, Footer } = Layout;

let pname = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_NAME;
let pvar = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_VAR;

let prj_label = TABLE_MICRO_SERVICE_FIELDS.FIELD_LABEL;
let prj_remark = TABLE_MICRO_SERVICE_FIELDS.FIELD_REMARK;

class Project extends Component {

  constructor(props) {
    super(props);
    this.state = {
      listColumn: [],
      prj: this.props.match.params.prj,
      tips: [],
      env: "",
    }
  }
  
  componentDidMount(): void {
    this.setListColumn();
    this.getEnvValueData(this.state.prj, this.state.env ? this.state.env : this.props.env);
    if(this.props.envs.length === 0) {
      getEnvs(this.props.dispatch);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.prj !== this.props.match.params.prj) {
        let prj = this.props.match.params.prj;
        this.getEnvValueData(prj, this.state.env ? this.state.env : this.props.env);
        let requestSendTip = new RequestSendTips();
        requestSendTip.init(prj, "", this.props.dispatch, env_vars => {});
        requestSendTip.getTips(envKeys => {
          let tips = [];
          for(let envKey of envKeys) {
            tips.push( {value: envKey} );
          }
          this.setState( { prj, tips } );
        });
      }
    }

  
    setListColumn = () => {
      let listColumn = cloneDeep(this.props.listColumn);
      listColumn.push({
        title: '操作',
        key: 'operater',
        width: 100,
        render: (_, record) => {
          return (
            <Space size="small">
              <Button type="link" icon={<EditOutlined />} onClick={()=>this.editPropertiesClick(record)} />
              {record[pname] === ENV_VALUE_API_HOST ? null : 
              <Popconfirm
                title="环境变量"
                description="确定删除该环境变量吗？"
                onConfirm={e => {
                    delEnvValue(this.state.prj, (this.state.env ? this.state.env : this.props.env), record, ()=>{
                      getEnvValues(this.state.prj, (this.state.env ? this.state.env : this.props.env), this.props.dispatch, env_vars=>{});
                    });
                }}
                okText="删除"
                cancelText="取消"
              >
                <Button danger type="link" icon={<DeleteOutlined />} />
              </Popconfirm>}
            </Space>
          )
        },
      });
      this.setState({listColumn});
    }

    setEnvironmentChange = (value: string) => {
      this.setState({env: value});
      this.getEnvValueData(this.state.prj, value);
    }
  
    addPropertiesClick = () => {
      this.props.dispatch({
          type: SHOW_ADD_PROPERTY_MODEL,
          open: true
      });
    }
  
    editPropertiesClick = (record) => {
      this.props.dispatch({
          type: SHOW_EDIT_PROPERTY_MODEL,
          open: true,
          pname: record[pname],
          pvalue: record[pvar],
      });
    }

    getEnvValueData = (prj: string, env: string) => {
      if(!isStringEmpty(env)) {
        getEnvValues(prj, env, this.props.dispatch, env_vars => {
          if(env_vars.length === 0) {
            addEnvValues(prj, env, ENV_VALUE_API_HOST, "", this.props.device, ()=>{
              getEnvValues(prj, env, this.props.dispatch, env_vars => {});
            });
          }
        });
      }
    }
  
    render() : ReactNode {
      return (
        <Layout>
          <Header style={{ padding: 0 }}>
            项目环境变量配置
          </Header>
          <Content style={{ margin: '0 16px' }}>
            <Breadcrumb style={{ margin: '16px 0' }} items={[{ title: '设置' }, { title: '环境变量' }]} />
            <Flex justify="space-between" align="center">
              <Form layout="inline">
                  <Form.Item label="项目">
                      {this.props.prjs.find(row => row[prj_label] === this.state.prj)[prj_remark]}
                  </Form.Item>
                  <Form.Item label="选择环境">
                      {this.props.envs.length > 0 ?
                      <Select
                        value={ this.state.env ? this.state.env : this.props.env }
                        onChange={this.setEnvironmentChange}
                        style={{ width: 120 }}
                        options={this.props.envs.map(item => {
                          return {value: item.label, label: item.remark}
                        })}
                      />
                      :
                      <Button type="link" href={"#" + ENV_LIST_ROUTE}>添加服务器环境</Button>
                      }
                  </Form.Item>
              </Form>
              <Button  style={{ margin: '16px 0' }} type="primary" onClick={this.addPropertiesClick} disabled={ isStringEmpty(this.state.env ? this.state.env : this.props.env) }>添加环境变量</Button>
              <AddEnvVarComponent tips={this.state.tips} />
            </Flex>
            <Table dataSource={this.props.listDatas} columns={this.state.listColumn} />
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            MyPostMan ©{new Date().getFullYear()} Created by 方海亮
          </Footer>
        </Layout>
      );
    }
}

function mapStateToProps (state) {
  return {
      listColumn: state.env_var.envVarListColumn,
      listDatas: state.env_var.list,
      env: state.env_var.env,
      prjs: state.prj.list,
      device : state.device,
      envs: state.env.list,
  }
}

export default connect(mapStateToProps)(Project);