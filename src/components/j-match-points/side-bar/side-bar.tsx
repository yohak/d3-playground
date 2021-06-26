import React, { FC, SyntheticEvent } from "react";
import { CheckBox, Select } from "grommet";
import { getMatchPoint, TeamStats } from "../process-data";
import { Visibility } from "../atoms";
import { CustomScrollBar } from "../../custom-scroll-bar";
import { categoryOptions, yearOptions } from "../consts";
import { useSideBar } from "./side-bar.hooks";
import { Aside } from "./side-bar.styles";

export type SideBarProps = {};

export enum ALL_CHECK {
  ON,
  NONE,
  INDETERMINATE,
}

export type QueryInfo = {
  year?: string;
  category?: string;
};

export const SideBar: FC<SideBarProps> = ({}) => {
  const {
    focusTeam,
    graphData,
    isGraphAnimating,
    visibilities,
    setVisibilities,
    setFocusTeam,
    allCheckState,
    setCategory,
    category,
    setYear,
    year,
  } = useSideBar();

  const changeChecked = (team: string) => {
    if (isGraphAnimating) {
      return;
    }
    setVisibilities(toggleVisibility(visibilities, team));
  };
  const getChecked = (team: string): boolean =>
    visibilities.find((v) => v.team === team)?.visible;
  const onClickAllCheck = () =>
    setVisibilities(toggleAllVisibility(visibilities, allCheckState));
  const onChangeCategory = (e: any) => setCategory(e.value.value);
  const onChangeYear = (e: any) => setYear(e.value.value);
  const onMouseOverTableRow = (e: SyntheticEvent) => {
    const teamName = findFocusTeam(e, visibilities);
    teamName ? setFocusTeam(teamName) : "";
  };
  const onMouseLeaveTableRow = () => setFocusTeam(null);

  return (
    <Aside>
      <CustomScrollBar style={{ width: "100%", height: "100%" }}>
        <div className={"selectors"}>
          <Select
            onChange={onChangeCategory}
            options={categoryOptions}
            value={categoryOptions.find((item) => item.value === category)}
            defaultValue={categoryOptions[0]}
            labelKey={"label"}
            valueKey={"value"}
          />
          <Select
            onChange={onChangeYear}
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
                  onClick={onClickAllCheck}
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
                onMouseOver={onMouseOverTableRow}
                onMouseLeave={onMouseLeaveTableRow}
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

const findFocusTeam = (
  e: SyntheticEvent,
  visibilities: Visibility[]
): string | null => {
  const tr: HTMLTableRowElement = (e.target as HTMLElement).closest("tr");
  const team = tr.dataset.team;
  if (visibilities.find((r) => r.team === team).visible) {
    return team;
  } else {
    return null;
  }
};

const toggleVisibility = (
  visibilities: Visibility[],
  team: string
): Visibility[] => {
  return visibilities.map((v) => {
    const visible = team === v.team ? !v.visible : v.visible;
    return { ...v, visible };
  });
};

const toggleAllVisibility = (
  visibilities: Visibility[],
  allCheckState: ALL_CHECK
): Visibility[] => {
  return visibilities.map((r) => ({
    ...r,
    visible: allCheckState !== ALL_CHECK.ON,
  }));
};

const sumGetStatus = (stats: TeamStats, point: number): number => {
  return stats.matches.filter((r) => getMatchPoint(r, stats.team) === point)
    .length;
};

export const __TEST__ = {
  findFocusTeam,
  toggleVisibility,
  toggleAllVisibility,
  sumGetStatus,
};
