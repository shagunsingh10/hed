import "@/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { Inter } from "next/font/google";
import { ConfigProvider, theme } from "antd";
import { SessionProvider } from "next-auth/react";
import AppLayout from "@/layouts/appLayout";
import { PRIMARY_COLOR, COLOR_BG_BASE } from "../constants";

const inter = Inter({ subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={inter.className}>
      <Head>
        <title>Herald</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: PRIMARY_COLOR,
            colorInfo: PRIMARY_COLOR,
            colorBgBase: COLOR_BG_BASE,
          },
          algorithm: [theme.darkAlgorithm],
        }}
      >
        <SessionProvider>
          <AppLayout>
            <Component {...pageProps} />
          </AppLayout>
        </SessionProvider>
      </ConfigProvider>
    </main>
  );
}
