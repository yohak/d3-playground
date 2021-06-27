import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  focusedTeamState,
  graphDataState,
  isGraphAnimatingState,
  visibilityState,
} from "../atoms";
import { parseSearchQuery, setSearchQuery } from "../../../utils/location";
import { categoryOptions, SelectOption, yearOptions } from "../consts";
import { findBorderLine, MatchData, processMatchStats } from "../process-data";
import { BorderArea } from "../graph";
import { ALL_CHECK, QueryInfo } from "./side-bar";

export const useSideBar = () => {
  const [year, setYear] = useState<string>(null);
  const [category, setCategory] = useState<string>(null);
  const [visibilities, setVisibilities] = useRecoilState(visibilityState);
  const [graphData, setGraphData] = useRecoilState(graphDataState);
  const [focusTeam, setFocusTeam] = useRecoilState(focusedTeamState);
  const isGraphAnimating = useRecoilValue(isGraphAnimatingState);
  const [allCheckState, setAllCheckState] = useState<ALL_CHECK>(ALL_CHECK.ON);

  useEffect(() => {
    const EVENT_POP_STATE = "popstate";
    const setQuery = () => {
      const query: QueryInfo = parseSearchQuery(location.search);
      setCategory(query?.category ?? categoryOptions[0].value);
      setYear(query?.year ?? yearOptions[0].value);
    };
    const popStateEventHandler = () => {
      setQuery();
    };
    window.addEventListener(EVENT_POP_STATE, popStateEventHandler);
    setQuery();

    return () => {
      window.removeEventListener(EVENT_POP_STATE, popStateEventHandler);
    };
  }, []);

  useEffect(() => {
    const searchQuery: QueryInfo = parseSearchQuery(location.search);
    const queryObj: QueryInfo = {};
    year ? (queryObj.year = year) : "";
    category ? (queryObj.category = category) : "";
    setSearchQuery(queryObj);
    if (
      !year &&
      !category &&
      (!!searchQuery?.year || !!searchQuery?.category)
    ) {
      return;
    }
    //
    const _year = year ? year : yearOptions[0].value;
    const _category = category ? category : categoryOptions[0].value;
    if (_category === "j2" && parseInt(_year) < 1999) {
      setYear("1999");
      return;
    }
    if (_category === "j3" && parseInt(_year) < 2014) {
      setYear("2014");
      return;
    }
    const url = `https://satoshionoda.github.io/j-score/matches-${_category}-${_year}.json`;
    fetch(url).then((res) =>
      res.json().then((matches: MatchData[]) => processLoadedData(matches))
    );
  }, [year, category]);

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

  return {
    year,
    setYear,
    category,
    setCategory,
    visibilities,
    setVisibilities,
    focusTeam,
    setFocusTeam,
    isGraphAnimating,
    allCheckState,
    graphData,
  };
};
