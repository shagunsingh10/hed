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
        width: "90vw",
        flexDirection: "column",
        gap: "1em",
        justifyContent: "center",
        alignItems: "center",
        opacity: 0.5,
        pointerEvents: "none",
      }}
    >
      <Spin
        size="small"
        indicator={<LoadingOutlined style={{ fontSize: 20 }} spin />}
      />
      <span>{message}</span>
    </div>
  );
};

export default Loader;
