import Head from "next/head";
import { COLOR_BG2, COLOR_BG3 } from "../../components/j-match-points/consts";
import styled from "styled-components";
import { Grommet } from "grommet";
import { SideBar } from "../../components/j-match-points/side-bar";
import { GraphWrapper } from "../../components/j-match-points/graph-wrapper";
import { InfoView } from "../../components/j-match-points/info-view";
import { myTheme } from "../../styles/grommet";

export default function JMatchPoints() {
  return (
    <Grommet theme={myTheme} themeMode={"dark"}>
      <Head>
        <title>J League Match Point Graph</title>
      </Head>
      <Wrapper>
        <header>
          <span>
            <a href="/j-match-points/">J League Match Point Graph</a>
          </span>
        </header>
        <Main>
          <GraphWrapper />
          <InfoView />
        </Main>
        <SideBar />
        <footer>
          <a href="https://twitter.com/satoshionoda/" target="_blank">
            (c) Satoshi Onoda
          </a>{" "}
          /{" "}
          <a href="https://yohak.design" target="_blank">
            Yohak LLC
          </a>
        </footer>
      </Wrapper>
    </Grommet>
  );
}
const headerHeight = 30;
const gridGap = 10;
const footerHeight = 15;
const wrapperPadding = 10;
const mainHeight = `calc(100vh - (${footerHeight}px + ${headerHeight}px + ${gridGap}px * 2 + ${wrapperPadding}px * 2))`;
const Main = styled.main`
  position: relative;
  background-color: ${COLOR_BG2};
  color: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
`;

const Wrapper = styled.div`
  //width: 100%;
  //height: 100vh;
  min-width: 1024px;
  height: 100vh;
  padding: ${wrapperPadding}px;
  background-color: ${COLOR_BG3};
  display: grid;
  grid-template-rows: ${headerHeight}px ${mainHeight} ${footerHeight}px;
  grid-template-columns: auto 350px;
  column-gap: 10px;
  row-gap: 10px;
  overflow: hidden;
  box-sizing: border-box;

  header {
    grid-row: 1;
    grid-column-start: 1;
    grid-column-end: 3;
    font-size: 28px;
    font-weight: bold;
    padding-left: 10px;
    letter-spacing: 0.05em;
    span {
      position: relative;
      top: 5px;
    }
  }

  footer {
    grid-column-start: 1;
    grid-column-end: 3;
    grid-row: 3;
    text-align: center;
    font-size: 11px;
    letter-spacing: 0.1em;
  }

  aside {
    background-color: ${COLOR_BG2};
    border-radius: 5px;
  }
`;
