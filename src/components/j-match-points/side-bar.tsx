import React, { FC, useEffect, useState } from "react";
import { CheckBox, Select } from "grommet";
import {
  findBorderLine,
  getMatchPoint,
  MatchData,
  processMatchStats,
  TeamStats,
} from "./logic/process-data";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  focusedTeamState,
  graphDataState,
  isGraphAnimatingState,
  Visibility,
  visibilityState,
} from "./atoms";
import styled from "styled-components";
import { BorderArea } from "./logic/graph";
import { CustomScrollBar } from "../custom-scroll-bar";
import { parseSearchQuery, setSearchQuery } from "../../utils/location";
import { categoryOptions, yearOptions } from "./consts";

export type SideBarProps = {};

enum ALL_CHECK {
  ON,
  NONE,
  INDETERMINATE,
}

export type QueryInfo = {
  year?: string;
  category?: string;
};

export const SideBar: FC<SideBarProps> = ({}) => {
  const [year, setYear] = useState<string>(null);
  const [category, setCategory] = useState<string>(null);
  const [visibilities, setVisibilities] = useRecoilState(visibilityState);
  const [graphData, setGraphData] = useRecoilState(graphDataState);
  const [focusTeam, setFocusTeam] = useRecoilState(focusedTeamState);
  const isGraphAnimating = useRecoilValue(isGraphAnimatingState);
  const [allCheckState, setAllCheckState] = useState<ALL_CHECK>(ALL_CHECK.ON);

  const processLoadedData = (matches: MatchData[]) => {
    const aclLine: BorderArea = {
      top: true,
      bottom: findBorderLine(matches, 3),
      color: "#FFFFFF0A",
    };
    const relegationLine: BorderArea = {
      top: findBorderLine(matches, 17),
      bottom: true,
      color: "#0000000A",
    };
    const points = processMatchStats(matches);
    setGraphData({ points, aclLine, relegationLine });
    const _visibilities = points.map((r) => ({ visible: true, team: r.team }));
    setVisibilities(_visibilities);
  };

  useEffect(() => {
    const searchQuery: QueryInfo = parseSearchQuery(location.search);
    const queryObj: QueryInfo = {};
    year ? (queryObj.year = year) : "";
    category ? (queryObj.category = category) : "";
    setSearchQuery(queryObj);
    if (!year && !category && (!!searchQuery.year || !!searchQuery.category)) {
      return;
    }
    //
    const _year = year ? year : yearOptions[0].value;
    const _category = category ? category : categoryOptions[0].value;
    const url = `https://satoshionoda.github.io/j-score/matches-${_category}-${_year}.json`;
    fetch(url).then((res) =>
      res.json().then((matches: MatchData[]) => processLoadedData(matches))
    );
  }, [year, category]);

  useEffect(() => {
    if (!graphData) {
      return;
    }
    const visibleCount = visibilities.filter((r) => !!r.visible).length;
    let result: ALL_CHECK;
    switch (true) {
      case visibleCount === graphData.points.length:
        result = ALL_CHECK.ON;
        break;
      case visibleCount === 0:
        result = ALL_CHECK.NONE;
        break;
      default:
        result = ALL_CHECK.INDETERMINATE;
    }
    setAllCheckState(result);
  }, [visibilities]);

  useEffect(() => {
    const query: QueryInfo = parseSearchQuery(location.search);
    if (!!query.category && query.category !== category) {
      setCategory(query.category);
    }
    if (!!query.year && query.year !== year) {
      setYear(query.year);
    }
  }, []);

  const changeChecked = (team: string) => {
    if (isGraphAnimating) {
      return;
    }
    const _visibilities: Visibility[] = visibilities.map((v) => {
      const visible = team === v.team ? !v.visible : v.visible;
      return { ...v, visible };
    });
    setVisibilities(_visibilities);
  };
  const getChecked = (team: string): boolean => {
    return visibilities.find((v) => v.team === team)?.visible;
  };
  const setFocused = (target: EventTarget) => {
    const tr: HTMLTableRowElement = (target as HTMLElement).closest("tr");
    const team = tr.dataset.team;
    if (visibilities.find((r) => r.team === team).visible) {
      setFocusTeam(tr.dataset.team);
    }
  };
  const onClickAllCheck = () => {
    const result: Visibility[] = visibilities.map((r) => ({
      ...r,
      visible: allCheckState !== ALL_CHECK.ON,
    }));
    setVisibilities(result);
  };

  return (
    <Aside>
      <CustomScrollBar style={{ width: "100%", height: "100%" }}>
        <div className={"selectors"}>
          <Select
            onChange={(e) => {
              setCategory(e.value.value);
            }}
            options={categoryOptions}
            value={categoryOptions.find((item) => item.value === category)}
            defaultValue={categoryOptions[0]}
            labelKey={"label"}
            valueKey={"value"}
          />
          <Select
            onChange={(e) => {
              setYear(e.value.value);
            }}
            options={yearOptions}
            value={yearOptions.find((item) => item.value === year)}
            labelKey={"label"}
            valueKey={"value"}
            defaultValue={yearOptions[0]}
          />
        </div>
        <table>
          <thead>
            <tr>
              <th>
                <CheckBox
                  onClick={() => onClickAllCheck()}
                  indeterminate={allCheckState === ALL_CHECK.INDETERMINATE}
                  checked={allCheckState === ALL_CHECK.ON}
                />
              </th>
              <th>勝点</th>
              <th>試合</th>
              <th>勝</th>
              <th>負</th>
              <th>分</th>
              <th>得点</th>
              <th>失点</th>
              <th>差</th>
            </tr>
          </thead>
          <tbody>
            {graphData?.points.map((item, i) => (
              <tr
                key={item.team}
                data-team={item.team}
                className={focusTeam === item.team ? "focused" : ""}
                onMouseOver={(e) => {
                  setFocused(e.target);
                }}
                onMouseLeave={(e) => {
                  setFocusTeam(null);
                }}
              >
                <td>
                  <span className={"check-group"}>
                    <span onClick={() => changeChecked(item.team)}>
                      <CheckBox
                        // label={item.team}
                        checked={getChecked(item.team)}
                      />
                    </span>
                    <span>{item.team}</span>
                  </span>
                </td>
                <td>{[...item.pt].pop()}</td>
                <td>{item.pt.length}</td>
                <td>{sumGetStatus(item, 3)}</td>
                <td>{sumGetStatus(item, 0)}</td>
                <td>{sumGetStatus(item, 1)}</td>
                <td>{[...item.gf].pop()}</td>
                <td>{[...item.ga].pop()}</td>
                <td>{[...item.gd].pop()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CustomScrollBar>
    </Aside>
  );
};

const sumGetStatus = (stats: TeamStats, point: number): number => {
  return stats.matches.filter((r) => getMatchPoint(r, stats.team) === point)
    .length;
};

const Aside = styled.aside`
  padding: 20px 10px;

  .scroll-wrapper {
    height: 100%;
  }

  .selectors {
    display: flex;
    gap: 10px;
  }

  .check-group {
    display: flex;
    gap: 6px;

    & > span:last-of-type {
      position: relative;
      top: 1px;
    }
  }

  table {
    font-size: 14px;
    margin-top: 20px;
    width: 100%;
    margin-bottom: 5px;

    thead {
      th {
        padding: 5px;
        font-weight: normal;

        &:first-child {
          vertical-align: bottom;
        }
      }
    }

    tbody {
      tr {
        background-color: transparent;
        transition-property: background-color;
        transition-duration: 0.1s;
        transition-timing-function: ease-out;

        &.focused,
        &:hover {
          background-color: #666666;
        }

        td {
          padding: 5px;
          border-top: 1px solid #cccccc;
          border-bottom: 1px solid #cccccc;
          user-select: none;
        }

        td:first-child span {
          display: flex;
          width: fit-content;
          white-space: nowrap;
        }

        td:nth-child(n + 2) {
          //background-color: blue;
          text-align: center;
          vertical-align: middle;
        }
      }
    }
  }
`;
