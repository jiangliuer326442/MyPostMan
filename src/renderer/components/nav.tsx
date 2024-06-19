import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Layout, Menu } from "antd";
import Dexie from 'dexie';

import { DB_NAME } from '../../config/db';
import { ChannelsUserInfoStr } from '../../config/global_config';
import registerMessageHook from '../actions/message';
import { getVersionIterators } from "../actions/version_iterator";
import { getPrjs } from "../actions/project";

const { Sider } = Layout;

class Nav extends Component {

    constructor(props) {
        super(props);

        registerMessageHook(this.props.dispatch, ()=>{});

        if(window.db === undefined) {
            // 创建一个 Dexie 数据库实例  
            window.db = new Dexie(DB_NAME);
        }

        require('../reducers/db/20240501001');
        require('../reducers/db/20240601001');
        require('../reducers/db/20240604001');
        require('../reducers/db/20240613001');

        this.state = {
          collapsed: false
        };
    }

    componentDidMount() {
      if (this.props.uuid === "") {
        if('electron' in window) {
          window.electron.ipcRenderer.sendMessage(ChannelsUserInfoStr, 'ping');
          this.cb();
        } else {
          alert("无法在当前环境中使用该 app");
        }
      } else {
        this.cb();
      }
      
    }

    cb = () => {
      getPrjs(this.props.dispatch);
      getVersionIterators(this.props.dispatch);
    }

    setCollapsed = (collapsed) => {
        this.setState({collapsed});
    }

    render() : ReactNode {
        return (
            <Sider collapsible collapsed={this.state.collapsed} onCollapse={(value) => this.setCollapsed(value)}>
                <div className="demo-logo-vertical" style={{
                    height: "32px",
                    margin: "16px",
                    background: "rgba(255, 255, 255, .2)",
                    borderRadius: "6px"
                    }} />
                <Menu theme="dark" defaultSelectedKeys={this.props.selected} mode="inline" items={this.props.navs} />
          </Sider>
        );
    }
}

function mapStateToProps (state) {
  return {
    uuid: state.device.uuid,
    selected: state.nav.selected,
    navs: state.nav.navs,
  }
}

export default connect(mapStateToProps)(Nav);