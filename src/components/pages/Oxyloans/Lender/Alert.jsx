import React from "react";
import { Alert, Button, Space } from "antd";
const App = () => (
  <Space
    direction="vertical"
    style={{
      width: "100%",
    }}
  >
    <Alert
      message="Info Text"
      description="Info Description Info Description Info Description Info Description"
      type="info"
      action={
        <Space direction="vertical">
          <Button size="small" type="primary">
            Accept
          </Button>
          <Button size="small" danger ghost>
            Decline
          </Button>
        </Space>
      }
      closable
    />
  </Space>
);
export default App;
