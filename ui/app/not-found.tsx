import React from "react";
import { Result, Button } from "antd";
import Link from "next/link";

const NotFoundPage = () => {
  return (
    <Result
      style={{ width: "100%" }}
      status="404"
      title="Page not found !"
      subTitle="Sorry, the page you are trying to visit does not exist."
      extra={
        <Link href="/">
          <Button type="primary">Back to Home</Button>
        </Link>
      }
    />
  );
};

export default NotFoundPage;
