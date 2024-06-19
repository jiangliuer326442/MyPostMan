import { Component, ReactNode } from 'react';
import { Select, Form, Button } from 'antd';
import { connect } from 'react-redux';

import { 
    PROJECT_LIST_ROUTE,
    ENV_LIST_ROUTE,
} from "../../../config/routers";
import { getEnvs } from '../../actions/env';

class PrjEnvSelect extends Component {

    constructor(props) {
        super(props);
        this.state = {
          prj: props.prj,
          env: props.env
        }
    }

    componentDidMount(): void {
        if(this.props.envs.length === 0) {
          getEnvs(this.props.dispatch);
        }
        this.props.cb(this.state.prj, this.state.env);
    }

    setProjectChange = (value: string) => {
        this.setState({prj: value});
        this.props.cb(value, this.state.env !== "" ? this.state.env : this.state.env);
    }
  
    setEnvironmentChange = (value: string) => {
        this.setState({env: value});
        this.props.cb(this.state.prj !== "" ? this.state.prj : this.state.prj, value);
    }

    render() : ReactNode {
        return (
            <Form layout="inline">
                <Form.Item label="选择项目">
                    {this.props.prjs.length > 0 ? 
                    <Select
                    value={ this.state.prj }
                    onChange={this.setProjectChange}
                    style={{ width: 170 }}
                    options={this.props.prjs.map(item => {
                        return {value: item.label, label: item.remark}
                    })}
                    />
                    : 
                    <Button type="link" href={"#" + PROJECT_LIST_ROUTE}>创建微服务</Button>
                    }
                </Form.Item>
                <Form.Item label="选择环境">
                    {this.props.envs.length > 0 ?
                    <Select
                    value={ this.state.env }
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
        );
    }
}

function mapStateToProps (state) {
    return {
        envs: state.env.list,
        prjs: state.prj.list,
    }
}

export default connect(mapStateToProps)(PrjEnvSelect);