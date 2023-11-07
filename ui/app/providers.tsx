"use client";

import { ConfigProvider, theme } from "antd";
import { SessionProvider } from "next-auth/react";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ConfigProvider
      theme={{
        algorithm: [
          theme.darkAlgorithm,
          // theme.compactAlgorithm
        ],
        token: {
          colorPrimary: "#2ed27c",
          colorPrimaryBg: "#2ed27c2a",
          colorBgContainer: "#242525",
          colorText: "rgba(200,200,200,0.65)",
        },
      }}
    >
      <SessionProvider>{children}</SessionProvider>
    </ConfigProvider>
  );
};
