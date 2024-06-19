import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Popconfirm, Switch } from 'antd';

import { 
    getVersionIterators, 
    closeVersionIterator } from '../../actions/version_iterator';

class MySwitch extends Component {

    constructor(props) {
        super(props);
        this.state = {
            defaultChecked: this.props.defaultChecked === 1,
        };
    }

    onChange = (checked: boolean) => {
        closeVersionIterator(this.props.uuid, ()=>{
            getVersionIterators(this.props.dispatch); 
        });
    };

    render() : ReactNode {
        return (
            <Popconfirm
                title="关闭迭代"
                description="关闭迭代后无法更新该迭代下的 api，确定关闭吗？"
                onConfirm={e => {
                    this.setState({defaultChecked: false})
                    this.onChange(false);
                }}
                onCancel={e => {
                    this.setState({defaultChecked: true})
                }}
                onOpenChange={(_, e) => {
                    e?.stopPropagation();
                }}
                disabled={!this.state.defaultChecked}
                okText="关闭"
                cancelText="取消"
            >
                <Switch value={this.state.defaultChecked} />
            </Popconfirm>
        )
    }

}

function mapStateToProps (state) {
    return {
    }
}
  
export default connect(mapStateToProps)(MySwitch);