import React, {Component} from 'react';

import {
    Badge,
    Button,
    Col,
    Divider,
    Drawer,
    Dropdown,
    Form,
    Input,
    Layout,
    Menu,
    Modal,
    Row,
    Space,
    Switch,
    Table,
    Tag,
    Tooltip,
    Typography,
} from "antd";
import qs from "qs";
import UserModal from "./UserModal";
import request from "../../common/request";
import {message} from "antd/es";
import {
    DeleteOutlined,
    DownOutlined,
    ExclamationCircleOutlined, FrownOutlined,
    InsuranceOutlined,
    LockOutlined,
    PlusOutlined,
    SyncOutlined,
    UndoOutlined
} from '@ant-design/icons';
import {getCurrentUser} from "../../service/permission";
import dayjs from "dayjs";
import UserShareSelectedAsset from "./UserShareSelectedAsset";

const confirm = Modal.confirm;
const {Search} = Input;
const {Title, Text} = Typography;
const {Content} = Layout;

class User extends Component {

    inputRefOfNickname = React.createRef();
    inputRefOfUsername = React.createRef();
    inputRefOfMail = React.createRef();
    changePasswordFormRef = React.createRef()

    state = {
        items: [],
        total: 0,
        queryParams: {
            pageIndex: 1,
            pageSize: 10
        },
        loading: false,
        modalVisible: false,
        modalTitle: '',
        modalConfirmLoading: false,
        model: null,
        selectedRowKeys: [],
        delBtnLoading: false,
        assetVisible: false,
        changePasswordVisible: false,
        changePasswordConfirmLoading: false,
        selectedRow: {}
    };

    componentDidMount() {
        this.loadTableData();
    }

    async loadTableData(queryParams) {
        this.setState({
            loading: true
        });

        queryParams = queryParams || this.state.queryParams;

        let paramsStr = qs.stringify(queryParams);

        let data = {
            items: [],
            total: 0
        };

        try {
            let result = await request.get('/users/paging?' + paramsStr);
            if (result.code === 1) {
                data = result.data;
            } else {
                message.error(result.message, 10);
            }
        } finally {
            this.setState({
                items: data.items,
                total: data.total,
                queryParams: queryParams,
                loading: false
            });
        }

    }

    handleChangPage = (pageIndex, pageSize) => {
        let queryParams = this.state.queryParams;
        queryParams.pageIndex = pageIndex;
        queryParams.pageSize = pageSize;

        this.setState({
            queryParams: queryParams
        });

        this.loadTableData(queryParams);
    };

    showDeleteConfirm(id, content, index) {
        let self = this;
        confirm({
            title: '您确定要删除此用户吗?',
            content: content,
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                self.delete(id, index);
            }
        });
    };

    showModal(title, user = {}) {
        this.setState({
            model: user,
            modalVisible: true,
            modalTitle: title
        });
    };

    handleCancelModal = () => {
        this.setState({
            modalVisible: false,
            modalTitle: ''
        });
    };

    handleOk = async (formData) => {
        // 弹窗 form 传来的数据
        this.setState({
            modalConfirmLoading: true
        });
        if (formData.id) {
            // 向后台提交数据
            const result = await request.put('/users/' + formData.id, formData);
            if (result.code === 1) {
                message.success('操作成功', 3);

                this.setState({
                    modalVisible: false
                });
                await this.loadTableData(this.state.queryParams);
            } else {
                message.error(result.message, 10);
            }
        } else {
            // 向后台提交数据
            const result = await request.post('/users', formData);
            if (result.code === 1) {
                message.success('操作成功', 3);

                this.setState({
                    modalVisible: false
                });
                await this.loadTableData(this.state.queryParams);
            } else {
                message.error(result.message, 10);
            }
        }

        this.setState({
            modalConfirmLoading: false
        });
    };

    handleSearchByUsername = username => {
        let query = {
            ...this.state.queryParams,
            'pageIndex': 1,
            'pageSize': this.state.queryParams.pageSize,
            'username': username,
        }

        this.loadTableData(query);
    };

    handleSearchByNickname = nickname => {
        let query = {
            ...this.state.queryParams,
            'pageIndex': 1,
            'pageSize': this.state.queryParams.pageSize,
            'nickname': nickname,
        }

        this.loadTableData(query);
    };

    handleSearchByMail = mail => {
        let query = {
            ...this.state.queryParams,
            'pageIndex': 1,
            'pageSize': this.state.queryParams.pageSize,
            'mail': mail,
        }

        this.loadTableData(query);
    };

    batchDelete = async () => {
        this.setState({
            delBtnLoading: true
        })
        try {
            let result = await request.delete('/users/' + this.state.selectedRowKeys.join(','));
            if (result['code'] === 1) {
                message.success('操作成功', 3);
                this.setState({
                    selectedRowKeys: []
                })
                await this.loadTableData(this.state.queryParams);
            } else {
                message.error(result['message'], 10);
            }
        } finally {
            this.setState({
                delBtnLoading: false
            })
        }
    }

    handleChangePassword = async (values) => {
        this.setState({
            changePasswordConfirmLoading: true
        })

        let formData = new FormData();
        formData.append('password', values['password']);
        let result = await request.post(`/users/${this.state.selectedRow['id']}/change-password`, formData);
        if (result['code'] === 1) {
            message.success('操作成功', 3);
        } else {
            message.error(result['message'], 10);
        }

        this.setState({
            changePasswordConfirmLoading: false,
            changePasswordVisible: false
        })
    }

    handleTableChange = (pagination, filters, sorter) => {
        let query = {
            ...this.state.queryParams,
            'order': sorter.order,
            'field': sorter.field
        }

        this.loadTableData(query);
    }

    async delete(id, index) {
        let items = this.state.items;
        try {
            items[index]['delLoading'] = true;
            this.setState({
                items: items
            });
            let result = await request.delete('/users/' + id);
            if (result.code === 1) {
                message.success('操作成功', 3);
                this.loadTableData(this.state.queryParams);
            } else {
                message.error(result.message, 10);
            }
        } finally {
            items[index]['delLoading'] = false;
            this.setState({
                items: items
            });
        }
    }

    changeUserStatus = async (id, checked, index) => {
        let items = this.state.items;
        try {
            items[index]['statusLoading'] = true;
            this.setState({
                items: items
            });
            let result = await request.patch(`/users/${id}/status?status=${checked ? 'enabled' : 'disabled'}`);
            if (result['code'] !== 1) {
                message.error(result['message']);
                return
            }
            this.loadTableData(this.state.queryParams);
        } finally {
            items[index]['statusLoading'] = false;
            this.setState({
                items: items
            });
        }
    }

    resetTOTP = async (id, index) => {
        let items = this.state.items;
        try {
            items[index]['resetTOTPLoading'] = true;
            this.setState({
                items: items
            });
            let result = await request.post(`/users/${id}/reset-totp`);
            if (result['code'] === 1) {
                message.success('操作成功', 3);
                this.loadTableData();
            } else {
                message.error(result['message'], 10);
            }
        } finally {
            items[index]['resetTOTPLoading'] = false;
            this.setState({
                items: items
            });
        }

    }

    render() {

        const columns = [{
            title: '序号',
            dataIndex: 'id',
            key: 'id',
            render: (id, record, index) => {
                return index + 1;
            }
        }, {
            title: '登录账号',
            dataIndex: 'username',
            key: 'username',
            sorter: true,
            render: (username, record) => {
                return (
                    <Button type="link" size='small'
                            onClick={async () => {
                                let result = await request.get(`/users/${record['id']}`);
                                if (result['code'] !== 1) {
                                    message.error(result['message']);
                                    return;
                                }
                                this.showModal('更新用户', result['data']);
                            }}>{username}</Button>
                );
            }
        }, {
            title: '用户昵称',
            dataIndex: 'nickname',
            key: 'nickname',
            sorter: true,
        }, {
            title: '用户类型',
            dataIndex: 'type',
            key: 'type',
            render: (text) => {

                if (text === 'user') {
                    return (
                        <Tag>普通用户</Tag>
                    );
                } else if (text === 'admin') {
                    return (
                        <Tag color="blue">管理用户</Tag>
                    );
                } else {
                    return text;
                }
            }
        }, {
            title: '邮箱',
            dataIndex: 'mail',
            key: 'mail',
        }, {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status, record, index) => {
                return <Switch checkedChildren="启用" unCheckedChildren="停用"
                               disabled={getCurrentUser()['id'] === record['id']}
                               loading={record['statusLoading']}
                               checked={status !== 'disabled'}
                               onChange={checked => {
                                   this.changeUserStatus(record['id'], checked, index);
                               }}/>
            }
        }, {
            title: '双因素认证',
            dataIndex: 'totpSecret',
            key: 'totpSecret',
            render: (text) => {

                if (text === '1') {
                    return <Tag icon={<InsuranceOutlined/>} color="success">已开启</Tag>;
                } else {
                    return <Tag icon={<FrownOutlined />} color="warning">未开启</Tag>;
                }
            }
        }, {
            title: '在线状态',
            dataIndex: 'online',
            key: 'online',
            render: text => {
                if (text) {
                    return (<Badge status="success" text="在线"/>);
                } else {
                    return (<Badge status="default" text="离线"/>);
                }
            }
        }, {
            title: '授权资产',
            dataIndex: 'sharerAssetCount',
            key: 'sharerAssetCount',
            render: (text, record) => {
                return <Button type='link' onClick={async () => {
                    this.setState({
                        assetVisible: true,
                        sharer: record['id']
                    })
                }}>{text}</Button>
            }
        }, {
            title: '创建日期',
            dataIndex: 'created',
            key: 'created',
            render: (text) => {
                return (
                    <Tooltip title={text}>
                        {dayjs(text).fromNow()}
                    </Tooltip>
                )
            },
            sorter: true,
        }, {
            title: '来源',
            dataIndex: 'source',
            key: 'source',
            render: (text) => {
                if (text === 'ldap') {
                    return (
                        <Tag color="gold">域同步</Tag>
                    );
                }
            }
        },
            {
                title: '操作',
                key: 'action',
                render: (text, record, index) => {

                    const menu = (
                        <Menu>
                            <Menu.Item key="1">
                                <Button type="text" size='small'
                                        disabled={record['source'] === 'ldap'}
                                        onClick={() => {
                                            this.setState({
                                                changePasswordVisible: true,
                                                selectedRow: record
                                            })
                                        }}>修改密码</Button>
                            </Menu.Item>

                            <Menu.Item key="2">
                                <Button type="text" size='small'
                                        loading={record['resetTOTPLoading']}
                                        onClick={() => {
                                            confirm({
                                                title: '您确定要重置此用户的双因素认证吗?',
                                                content: record['name'],
                                                okText: '确定',
                                                cancelText: '取消',
                                                onOk: async () => {
                                                    this.resetTOTP(record['id'], index);
                                                }
                                            });
                                        }}>重置双因素认证</Button>
                            </Menu.Item>

                            <Menu.Item key="3">
                                <Button type="text" size='small'
                                        onClick={() => {
                                            this.setState({
                                                assetVisible: true,
                                                sharer: record['id']
                                            })
                                        }}>资产授权</Button>
                            </Menu.Item>

                            <Menu.Divider/>
                            <Menu.Item key="5">
                                <Button type="text" size='small' danger
                                        disabled={getCurrentUser()['id'] === record['id']}
                                        loading={record['delLoading']}
                                        onClick={() => this.showDeleteConfirm(record.id, record.name, index)}>删除</Button>
                            </Menu.Item>
                        </Menu>
                    );

                    return (
                        <div>
                            <Button type="link" size='small'
                                    disabled={getCurrentUser()['id'] === record['id']}
                                    onClick={async () => {
                                        let result = await request.get(`/users/${record['id']}`);
                                        if (result['code'] !== 1) {
                                            message.error(result['message']);
                                            return;
                                        }
                                        this.showModal('更新用户', result['data']);
                                    }}>编辑</Button>
                            <Dropdown overlay={menu}>
                                <Button type="link" size='small'>
                                    更多 <DownOutlined/>
                                </Button>
                            </Dropdown>
                        </div>
                    )
                },
            }
        ];

        const selectedRowKeys = this.state.selectedRowKeys;
        const rowSelection = {
            selectedRowKeys: this.state.selectedRowKeys,
            onChange: (selectedRowKeys) => {
                this.setState({selectedRowKeys});
            },
        };
        const hasSelected = selectedRowKeys.length > 0;

        return (
            <>
                <Content className="site-layout-background page-content">
                    <div style={{marginBottom: 20}}>
                        <Row justify="space-around" align="middle" gutter={24}>
                            <Col span={8} key={1}>
                                <Title level={3}>用户列表</Title>
                            </Col>
                            <Col span={16} key={2} style={{textAlign: 'right'}}>
                                <Space>

                                    <Search
                                        ref={this.inputRefOfNickname}
                                        placeholder="用户昵称"
                                        allowClear
                                        onSearch={this.handleSearchByNickname}
                                    />

                                    <Search
                                        ref={this.inputRefOfUsername}
                                        placeholder="登录账号"
                                        allowClear
                                        onSearch={this.handleSearchByUsername}
                                    />

                                    <Search
                                        ref={this.inputRefOfMail}
                                        placeholder="邮箱"
                                        allowClear
                                        onSearch={this.handleSearchByMail}
                                    />

                                    <Tooltip title='重置查询'>

                                        <Button icon={<UndoOutlined/>} onClick={() => {
                                            this.inputRefOfUsername.current.setValue('');
                                            this.inputRefOfNickname.current.setValue('');
                                            this.inputRefOfMail.current.setValue('');
                                            this.loadTableData({pageIndex: 1, pageSize: 10})
                                        }}>

                                        </Button>
                                    </Tooltip>

                                    <Divider type="vertical"/>

                                    <Tooltip title="新增">
                                        <Button type="dashed" icon={<PlusOutlined/>}
                                                onClick={() => this.showModal('新增用户', {})}>

                                        </Button>
                                    </Tooltip>

                                    <Tooltip title="刷新列表">
                                        <Button icon={<SyncOutlined/>} onClick={() => {
                                            this.loadTableData(this.state.queryParams)
                                        }}>

                                        </Button>
                                    </Tooltip>

                                    <Tooltip title="批量删除">
                                        <Button type="primary" danger disabled={!hasSelected} icon={<DeleteOutlined/>}
                                                loading={this.state.delBtnLoading}
                                                onClick={() => {
                                                    const content = <div>
                                                        您确定要删除选中的<Text style={{color: '#1890FF'}}
                                                                       strong>{this.state.selectedRowKeys.length}</Text>条记录吗？
                                                    </div>;
                                                    confirm({
                                                        icon: <ExclamationCircleOutlined/>,
                                                        content: content,
                                                        onOk: () => {
                                                            this.batchDelete()
                                                        },
                                                        onCancel() {

                                                        },
                                                    });
                                                }}>

                                        </Button>
                                    </Tooltip>

                                </Space>
                            </Col>
                        </Row>
                    </div>

                    <Table rowSelection={rowSelection}
                           rowKey='id'
                           dataSource={this.state.items}
                           columns={columns}
                           position={'both'}
                           pagination={{
                               showSizeChanger: true,
                               current: this.state.queryParams.pageIndex,
                               pageSize: this.state.queryParams.pageSize,
                               onChange: this.handleChangPage,
                               onShowSizeChange: this.handleChangPage,
                               total: this.state.total,
                               showTotal: total => `总计 ${total} 条`
                           }}
                           loading={this.state.loading}
                           onChange={this.handleTableChange}
                    />

                    {/* 为了屏蔽ant modal 关闭后数据仍然遗留的问题*/}
                    {
                        this.state.modalVisible ?
                            <UserModal
                                visible={this.state.modalVisible}
                                title={this.state.modalTitle}
                                handleOk={this.handleOk}
                                handleCancel={this.handleCancelModal}
                                confirmLoading={this.state.modalConfirmLoading}
                                model={this.state.model}
                            >
                            </UserModal> : undefined
                    }

                    <Drawer
                        title="资产授权"
                        placement="right"
                        closable={true}
                        destroyOnClose={true}
                        onClose={() => {
                            this.loadTableData(this.state.queryParams);
                            this.setState({
                                assetVisible: false
                            })
                        }}
                        visible={this.state.assetVisible}
                        width={window.innerWidth * 0.8}
                    >
                        <UserShareSelectedAsset
                            sharer={this.state.sharer}
                            userGroupId={undefined}
                        >
                        </UserShareSelectedAsset>
                    </Drawer>

                    {
                        this.state.changePasswordVisible ?
                            <Modal title="修改密码" visible={this.state.changePasswordVisible}
                                   confirmLoading={this.state.changePasswordConfirmLoading}
                                   maskClosable={false}
                                   onOk={() => {
                                       this.changePasswordFormRef.current
                                           .validateFields()
                                           .then(values => {
                                               this.changePasswordFormRef.current.resetFields();
                                               this.handleChangePassword(values);
                                           });
                                   }}
                                   onCancel={() => {
                                       this.setState({
                                           changePasswordVisible: false
                                       })
                                   }}>

                                <Form ref={this.changePasswordFormRef}>

                                    <Form.Item name='password' rules={[{required: true, message: '请输入新密码'}]}>
                                        <Input prefix={<LockOutlined/>} placeholder="请输入新密码"/>
                                    </Form.Item>
                                </Form>
                            </Modal> : undefined
                    }

                </Content>
            </>
        );
    }
}

export default User;
