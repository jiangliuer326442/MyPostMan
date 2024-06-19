import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { 
  Breadcrumb, Layout,
  Flex, Space, Button, Popconfirm, Table
} from "antd";
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

import { isStringEmpty } from '../../util';
import { TABLE_ENV_VAR_FIELDS } from '../../../config/db';
import { ENV_VALUE_API_HOST } from '../../../config/envKeys';
import { SHOW_ADD_PROPERTY_MODEL, SHOW_EDIT_PROPERTY_MODEL } from '../../../config/redux';
import { addEnvValues, getEnvValues, delEnvValue } from '../../actions/env_value';
import RequestSendTips from '../../classes/RequestSendTips';
import AddEnvVarComponent from '../../components/env_var/add_env_var';
import SelectPrjEnvComponent from '../../components/env_var/select_prj_env';

var _ = require('lodash');

const { Header, Content, Footer } = Layout;

let pname = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_NAME;
let pvar = TABLE_ENV_VAR_FIELDS.FIELD_PARAM_VAR;

class Project extends Component {

    constructor(props) {
      super(props);
      this.state = {
        listColumn: [],
        prj: "",
        tips: [],
      }
    }
  
    componentDidMount(): void {
        this.setListColumn();
    }

    componentDidUpdate(prevProps) {
      if (prevProps.prj !== this.state.prj) {
        let prj = prevProps.prj;
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
      let listColumn = _.cloneDeep(this.props.listColumn);
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
                    delEnvValue(this.props.prj, this.props.env, record, ()=>{
                      getEnvValues(this.props.prj, this.props.env, this.props.dispatch, env_vars=>{});
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
      if(!(isStringEmpty(prj) || isStringEmpty(env))) {
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
              <SelectPrjEnvComponent prj={ this.props.prj } env={ this.props.env } cb={this.getEnvValueData} />
              <Button  style={{ margin: '16px 0' }} type="primary" onClick={this.addPropertiesClick} disabled={ isStringEmpty(this.props.prj) || isStringEmpty(this.props.env) }>添加环境变量</Button>
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
        prj: state.env_var.prj,
        env: state.env_var.env,
        device : state.device,
    }
}

export default connect(mapStateToProps)(Project);