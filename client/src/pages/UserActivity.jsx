import React, { useEffect, useState } from 'react';
import { Button, List, message } from 'antd';
import { axiosInstance } from '../helpers/axiosInstance'; // Adjust the import path if needed

const UserActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/users/activity', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }); // Endpoint to get user activity logs
      setLogs(response.data);
    } catch (error) {
      message.error('Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    setLoading(true);
    try {
      await axiosInstance.post('/api/users/activity/clear'); // Endpoint to clear user activity logs
      setLogs([]);
      message.success('Logs cleared successfully');
    } catch (error) {
      message.error('Failed to clear logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="user-activity-logs" style={{ maxWidth: 600, margin: 'auto' }}>
      <Button
        type="primary"
        onClick={clearLogs}
        loading={loading}
        style={{ marginBottom: 16 }}
      >
        Clear Logs
      </Button>
      <List
        bordered
        dataSource={logs}
        loading={loading}
        renderItem={(item) => (
          <List.Item>
            <div>
              <p><strong>Timestamp:</strong> {item.timestamp}</p>
              <p><strong>Method:</strong> {item.method}</p>
              <p><strong>URL:</strong> {item.url}</p>
              <p><strong>Username:</strong> {item.username}</p>
              <p><strong>Body:</strong> {JSON.stringify(item.body)}</p>
            </div>
          </List.Item>
        )}
      />
    </div>
  );
};

export default UserActivityLogs;
