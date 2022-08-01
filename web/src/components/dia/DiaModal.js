import React, {useEffect, useState} from 'react';
import {
    Alert,
    Col,
    Collapse,
    Form,
    Input,
    InputNumber,
    Modal,
    Radio,
    Row,
    Select,
    Switch,
    Tooltip,
    Typography
} from "antd/lib/index";
import {isEmpty} from "../../utils/utils";
import request from "../../common/request";

const {TextArea} = Input;
const {Option} = Select;
const {Text} = Typography;
const {Panel} = Collapse;

// 子级页面
// Ant form create 表单内置方法
const formLayout = {
    labelCol: {span: 6},
    wrapperCol: {span: 18},
};

const DiaModal = function ({title, visible, handleOk, handleCancel, confirmLoading, credentials, tags, model}) {

    const [form] = Form.useForm();
    for (let key in model) {
        if (model.hasOwnProperty(key)) {
            if (model[key] === '-') {
                model[key] = '';
            }
        }
    }


    const handleIsDiaChange = v => {
        console.log("test")
    }
    const handleRequestMathChange = v => {
        console.log("test")
    }
    return (

        <Modal
            title={title}
            visible={visible}
            maskClosable={false}
            onOk={() => {
                form
                    .validateFields()
                    .then(values => {
                        form.resetFields();
                        handleOk(values);
                    })
                    .catch(info => {
                    });
            }}
            centered={true}
            width={1040}
            onCancel={handleCancel}
            confirmLoading={confirmLoading}
            okText='确定'
            cancelText='取消'
        >

            <Form form={form} {...formLayout} initialValues={model}>
                <Row>
                    <Col span={13}>
                        <Form.Item name='id' noStyle>
                            <Input hidden={true}/>
                        </Form.Item>

                        <Form.Item label="拨测名称" name='name' rules={[{required: true, message: "请输入拨测名称"}]}>
                            <Input placeholder="拨测名称"/>
                        </Form.Item>

                        <Form.Item label="拨测url" name='url' rules={[{required: true, message: '请输入需要拨测的url'}]}>
                            <Input placeholder="拨测的url地址"/>
                        </Form.Item>

                        <Form.Item label="请求方法" name='requestmath' rules={[{required: true, message: '请选择拨测方法'}]}>
                            <Radio.Group onChange={handleRequestMathChange}>
                                <Radio value="get">GET</Radio>
                                <Radio value="post">POST</Radio>
                                <Radio value="delete">DELETE</Radio>
                                <Radio value="put">PUT</Radio>
                            </Radio.Group>
                        </Form.Item>

                        <Form.Item label="启用拨测" name='isdia' rules={[{required: true, message: '选择是否立即启用拨测'}]}>
                            <Radio.Group onChange={handleIsDiaChange}>
                                <Radio value="ondia">启用</Radio>
                                <Radio value="offdia">暂不启用</Radio>
                            </Radio.Group>
                        </Form.Item>
                        <Form.Item label="标签" name='tags'>
                            <Select mode="tags" placeholder="标签可以更加方便的检索资产">
                                {tags.map(tag => {
                                    if (tag === '-') {
                                        return undefined;
                                    }
                                    return (<Option key={tag}>{tag}</Option>)
                                })}
                            </Select>
                        </Form.Item>

                        <Form.Item label="备注" name='description'>
                            <TextArea rows={4} placeholder='关于资产的一些信息您可以写在这里'/>
                        </Form.Item>
                    </Col>
                </Row>


            </Form>
        </Modal>
    )
}

export default DiaModal;
