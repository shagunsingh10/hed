import React, { FC } from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

type Loaderprops = {
  message?: string;
};

const Loader: FC<Loaderprops> = ({ message }) => {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "20px",
        display: "flex",
        height: "100vh",
        width: "100vw",
        flexDirection: "column",
        gap: "1em",
        justifyContent: "center",
        alignItems: "center",
        opacity: 0.5,
        pointerEvents: "none",
      }}
    >
      <Spin
        size="large"
        indicator={<LoadingOutlined style={{ fontSize: 44 }} spin />}
      />
      <span>{message}</span>
    </div>
  );
};

export default Loader;
