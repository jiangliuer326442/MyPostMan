import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import { Breadcrumb, Layout, FloatButton, Result } from "antd";
import { FileMarkdownOutlined, Html5Outlined, ExportOutlined } from '@ant-design/icons';

import { 
    ChannelsMarkdownStr, 
    ChannelsMarkdownShowStr, 
    ChannelsMarkdownSaveMarkdownStr, 
    ChannelsMarkdownSaveHtmlStr,
    CONTENT_TYPE_URLENCODE,
} from '../../../config/global_config';
import MarkdownView from '../../components/markdown/show';
import { getPrjs } from '../../actions/project';
import { getVersionIterator } from '../../actions/version_iterator';
import { getVersionIteratorRequestsByProject } from '../../actions/version_iterator_requests';

const { Header, Content, Footer } = Layout;

class IteratorDoc extends Component {

    constructor(props) {
        super(props);
        let iteratorId = this.props.match.params.uuid;
        sessionStorage.setItem("iterator_doc_iteratorId", iteratorId);
        this.state = {
            iteratorId,
            md: "",
            versionIteration: "",
            requests: [],
            prjs: [],
            errorCode: 1000,
            errorMessage: "",
        };
    }

    async componentDidMount() {
        if('electron' in window) {
            this.loadMarkDownFromElectron(this.state.iteratorId);
        } else {
            try {
                axios.post("/sprint/docs", { 
                    iteratorId: this.state.iteratorId 
                }, {
                    headers: {
                        "Content-Type": CONTENT_TYPE_URLENCODE,
                    }
                }).then(response => {
                    if (response.data.code === 1000) {
                        this.setState({
                            md: response.data.data.markdown
                        });
                        document.title = response.data.data.title;
                    } else {
                        this.setState({
                            errorCode: response.data.code,
                            errorMessage: response.data.message,
                        });
                    }
                });
            } catch (error) {
                console.error(error);
            }
        }
    }

    loadMarkDownFromElectron = async (iteratorId : string) => {
        let prjs = await getPrjs(null);
        let versionIteration = await getVersionIterator(iteratorId);
        let requests = await getVersionIteratorRequestsByProject(iteratorId, "", null, "", "");

        this.setState({prjs, versionIteration, requests});

        if(prjs.length > 0 && requests.length > 0 && Object.keys(versionIteration).length > 0) {
            window.electron.ipcRenderer.sendMessage(ChannelsMarkdownStr, ChannelsMarkdownShowStr, versionIteration, requests, prjs);

            window.electron.ipcRenderer.on(ChannelsMarkdownStr, (action, iteratorId, markdownTitle, markdownContent) => {
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
                    {this.state.errorCode === 1000 ? 
                    <MarkdownView showNav={ true } content={ this.state.md } show={ true } />
                    : null}
                    {(this.state.errorCode === 403 || this.state.errorCode === 404) ?
                    <Result
                        status={ this.state.errorCode }
                        title={ this.state.errorCode }
                        subTitle={this.state.errorMessage}
                    />
                    : null} 
                    {'electron' in window ? 
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
                            onClick={()=>window.electron.ipcRenderer.sendMessage(ChannelsMarkdownStr, ChannelsMarkdownSaveHtmlStr, this.state.versionIteration, this.state.requests, this.state.prjs)} 
                        />
                        <FloatButton 
                            icon={<FileMarkdownOutlined />} 
                            description="md"
                            shape="square"
                            onClick={ ()=> window.electron.ipcRenderer.sendMessage(ChannelsMarkdownStr, ChannelsMarkdownSaveMarkdownStr, this.state.versionIteration, this.state.requests, this.state.prjs) } 
                        />
                    </FloatButton.Group>
                    :null}
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