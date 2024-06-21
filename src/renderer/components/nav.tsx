import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Layout, Menu, Flex } from "antd";
import Dexie from 'dexie';

import { DB_NAME } from '../../config/db';
import { ChannelsUserInfoStr, ChannelsUserInfoPingStr } from '../../config/global_config';
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
          window.electron.ipcRenderer.sendMessage(ChannelsUserInfoStr, ChannelsUserInfoPingStr);
          this.cb();
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
            <Flex gap="middle" vertical style={{
              height: "32px",
              margin: "16px",
            }}>
              <h3 style={{lineHeight: 0,
                color: "#5DE2E7",
                marginLeft: 5,
                marginTop: 10,
                fontSize: 25,
                fontFamily: "serif"
              }}>{this.props.appName}</h3>
              <p style={{
                color: "#fff",
                marginTop: -30,
                fontSize: 10,
                textAlign: "right",
                marginRight: 9
              }}>{this.props.appVersion}</p>
              </Flex>
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
    appName: state.device.appName,
    appVersion: state.device.appVersion,
  }
}

export default connect(mapStateToProps)(Nav);