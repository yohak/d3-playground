import React, { FC } from "react";
import styled from "styled-components";
import { COLOR_BG3 } from "./consts";
import { MatchData } from "./logic/process-data";
import { useRecoilValue } from "recoil";
import { focusedMatchState } from "./atoms";

export type InfoProps = {};

export const InfoView: FC<InfoProps> = ({}) => {
  const match = useRecoilValue(focusedMatchState);

  return (
    <Wrapper className={match ? "has-data" : ""}>
      {match && (
        <div>
          <p className={"date"}>{match?.date}</p>
          <p className={"score"}>
            <span>
              <span className={"home"}>{match.homeScore}</span>
              <span>-</span>
              <span className={"away"}>{match.awayScore}</span>
            </span>
          </p>
          <p className={"team"}>
            <span>
              <span className={"home"}>{match?.homeTeam}</span>
              <span>VS</span>
              <span className={"away"}>{match?.awayTeam}</span>
            </span>
          </p>
        </div>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 150px;
  height: 80px;
  box-sizing: border-box;
  padding: 10px;
  background-color: ${COLOR_BG3};
  position: absolute;
  top: 60px;
  left: 100px;
  border-radius: 5px;
  font-size: 14px;
  line-height: 1;
  opacity: 0;
  pointer-events: none;
  transition-property: opacity;
  transition-duration: 300ms;
  transition-timing-function: ease-out;
  &.has-data {
    opacity: 1;
  }
  p {
    text-align: center;
  }
  .score {
    margin-top: 5px;
    font-size: 20px;
    .home {
      position: absolute;
      right: 10px;
      text-align: right;
    }
    .away {
      position: absolute;
      left: 10px;
      text-align: left;
    }
    & > span {
      position: relative;
      line-height: 1;
    }
  }
  .team {
    margin-top: 5px;
    font-size: 14px;
    .home {
      width: 80px;
      position: absolute;
      right: 25px;
      text-align: right;
    }
    .away {
      width: 80px;
      position: absolute;
      left: 25px;
      text-align: left;
    }
    & > span {
      position: relative;
      line-height: 1;
    }
  }
`;
