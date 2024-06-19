import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Breadcrumb, Layout, FloatButton } from "antd";
import { FileMarkdownOutlined, Html5Outlined, ExportOutlined } from '@ant-design/icons';

import { ChannelsMarkdownStr, ChannelsMarkdownShowStr, ChannelsMarkdownSaveMarkdownStr, ChannelsMarkdownSaveHtmlStr } from '../../../config/global_config';
import MarkdownView from '../../components/markdown/show';
import { getPrjs } from '../../actions/project';
import { getVersionIterator } from '../../actions/version_iterator';
import { getVersionIteratorRequestsByProject } from '../../actions/version_iterator_requests';

const { Header, Content, Footer } = Layout;

class IteratorDoc extends Component {

    constructor(props) {
        super(props);
        let iteratorId = this.props.match.params.uuid;
        this.state = {
            iteratorId,
            versionIteration: {},
            requests: [],
            prjs: [],
            md: "",
        };
    }

    componentDidMount(): void {
        if(this.props.prjs.length === 0) {
            getPrjs(this.props.dispatch).then(prjs => this.setState( { prjs }, this.checkFinish ));
        } else {
            this.setState( { prjs: this.props.prjs }, this.checkFinish );
        }
        getVersionIterator(this.state.iteratorId).then(versionIteration => this.setState( { versionIteration }, this.checkFinish ));
        getVersionIteratorRequestsByProject(this.state.iteratorId, "", null, "", "").then(requests => this.setState( { requests }, this.checkFinish ));
    }

    checkFinish = () => {
        if(this.state.prjs.length > 0 && this.state.requests.length > 0 && Object.keys(this.state.versionIteration).length > 0) {
            window.electron.ipcRenderer.sendMessage(ChannelsMarkdownStr, ChannelsMarkdownShowStr, this.state.versionIteration, this.state.requests, this.state.prjs);

            window.electron.ipcRenderer.on(ChannelsMarkdownStr, (action, iteratorId, markdownContent) => {
                if (action !== ChannelsMarkdownShowStr) return;
                if(iteratorId === this.state.iteratorId) {
                    this.setState( { md : markdownContent } );
                }
            });
        }
    }

    render() : ReactNode {
        return (
            <Layout>
                <Header style={{ padding: 0 }}>
                    迭代文档
                </Header>
                <Content style={{ margin: '0 16px' }}>
                    <Breadcrumb style={{ margin: '16px 0' }} items={[
                        { title: '迭代' }, 
                        { title: '文档' }
                    ]} />
                    <MarkdownView showNav={ true } content={ this.state.md } show={ true } />
                    <FloatButton.Group
                        trigger="click"
                        description="导出文档"
                        shape="square"
                        type="primary"
                        style={{ right: 96 }}
                        icon={<ExportOutlined />}
                        >
                        <FloatButton 
                            icon={<Html5Outlined/>} 
                            description="html"
                            shape="square"
                            onClick={()=>window.electron.ipcRenderer.sendMessage(ChannelsMarkdownStr, ChannelsMarkdownSaveHtmlStr, this.state.versionIteration)} 
                        />
                        <FloatButton 
                            icon={<FileMarkdownOutlined />} 
                            description="md"
                            shape="square"
                            onClick={ ()=> window.electron.ipcRenderer.sendMessage(ChannelsMarkdownStr, ChannelsMarkdownSaveMarkdownStr, this.state.versionIteration) } 
                        />
                    </FloatButton.Group>
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
        prjs: state.prj.list,
    }
}
      
export default connect(mapStateToProps)(IteratorDoc);