import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useDispatch } from 'react-redux';
import { HideLoading, ShowLoading } from '../redux/alertsSlice';
import { axiosInstance } from '../helpers/axiosInstance';

const ChangePasswordForm = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [passwordStrength, setPasswordStrength] = useState('');

  const validatePassword = (password) => {
    const lengthCriteria = password.length >= 8 && password.length <= 12;
    const complexityCriteria = /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password) && /[!@#$%^&*]/.test(password);

    if (!lengthCriteria) return 'Password must be between 8 and 12 characters long.';
    if (!complexityCriteria) return 'Password must include uppercase letters, lowercase letters, numbers, and special characters.';
    
    return 'Password strength: Good';
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    const validationMessage = validatePassword(password);
    setPasswordStrength(validationMessage);
  };

  const onFinish = async (values) => {
    dispatch(ShowLoading());
    try {
      await axiosInstance.post('/api/change/password', values, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      message.success('Password changed successfully');
      form.resetFields();
    } catch (error) {
      message.error('Failed to change password');
    } finally {
      dispatch(HideLoading());
    }
  };

  return (
    <div className="change-password-form" style={{ maxWidth: 400, margin: 'auto' }}>
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Form.Item
          label="Current Password"
          name="currentPassword"
          rules={[{ required: true, message: 'Please input your current password!' }]}
        >
          <Input.Password
            prefix={<i className="ri-lock-line" style={{ fontSize: '16px' }} />} // Lock icon for current password
            placeholder="Enter your current password"
          />
        </Form.Item>

        <Form.Item
          label="New Password"
          name="newPassword"
          rules={[{ required: true, message: 'Please input your new password!' }]}
        >
          <Input.Password
            prefix={<i className="ri-lock-password-line" style={{ fontSize: '16px' }} />} // Lock password icon
            onChange={handlePasswordChange}
            placeholder="Enter a new password"
          />
        </Form.Item>

        <Form.Item
          label="Confirm New Password"
          name="confirmPassword"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Please confirm your new password!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('The two passwords that you entered do not match!'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<i className="ri-lock-password-line" style={{ fontSize: '16px' }} />} // Lock password icon
            placeholder="Confirm your new password"
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Change Password
          </Button>
        </Form.Item>
      </Form>
      {passwordStrength && (
        <div className="password-strength-feedback" style={{ color: passwordStrength.includes('Good') ? 'green' : 'red' }}>
          <p>{passwordStrength}</p>
        </div>
      )}
    </div>
  );
};

export default ChangePasswordForm;
