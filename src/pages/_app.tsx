import "../styles/html5reset.css";
import "../styles/globals.css";
import { AppProps } from "next/app";
import { RecoilRoot } from "recoil";
import React from "react";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <RecoilRoot>
      <Component {...pageProps} />
    </RecoilRoot>
  );
}

export default MyApp;
