import React from "react";
import { Spin } from "antd";

const Loader = () => {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "20px",
        position: "absolute",
        height: "50%",
        minWidth: "100%",
      }}
    >
      <Spin size="large" />
    </div>
  );
};

export default Loader;
