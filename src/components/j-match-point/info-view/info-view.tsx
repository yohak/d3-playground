import React, { FC } from "react";
import { useRecoilValue } from "recoil";
import { focusedMatchState } from "../atoms";
import { Wrapper } from "./info-view.styles";

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
