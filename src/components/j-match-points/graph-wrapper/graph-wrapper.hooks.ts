import { useRecoilState } from "recoil";
import {
  focusedMatchState,
  focusedTeamState,
  graphDataState,
  isGraphAnimatingState,
  visibilityState,
} from "../atoms";
import { useEffect, useRef } from "react";
import { destroy } from "../../../utils/d3";
import { Graph } from "../graph";

export const useGraphWrapper = () => {
  const [graphData, setGraphData] = useRecoilState(graphDataState);
  const [visibilities, setVisibilities] = useRecoilState(visibilityState);
  const [focusedTeam, setFocusedTeam] = useRecoilState(focusedTeamState);
  const [isGraphAnimating, setIsGraphAnimating] = useRecoilState(
    isGraphAnimatingState
  );
  const [focusedMatch, setFocusedMatch] = useRecoilState(focusedMatchState);

  const d3Canvas = useRef();

  //
  let resizeTimeout: number;
  const onResize = () => {
    window.clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout(() => {
      destroy(d3Canvas.current);
      Graph.getInstance().init({
        elm: d3Canvas.current,
        data: graphData,
        setFocusedTeam,
        setIsGraphAnimating,
        setFocusedMatch,
      });
      Graph.getInstance().drawLines(visibilities);
    }, 500);
  };

  useEffect(() => {
    if (graphData) {
      window.removeEventListener("resize", onResize);
      window.addEventListener("resize", onResize);

      Graph.getInstance().init({
        elm: d3Canvas.current,
        data: graphData,
        setFocusedTeam,
        setIsGraphAnimating,
        setFocusedMatch,
      });
    }
    return () => {
      window.removeEventListener("resize", onResize);
      destroy(d3Canvas.current);
    };
  }, [graphData]);
  useEffect(() => {
    if (!visibilities.length) {
      return;
    }
    Graph.getInstance().drawLines(visibilities);
  }, [visibilities]);
  useEffect(() => {
    if (!!focusedTeam) {
      if (!isGraphAnimating) {
        Graph.getInstance().focus(focusedTeam);
      }
    } else {
      Graph.getInstance().unFocus();
    }
  }, [focusedTeam]);
  useEffect(() => {
    if (isGraphAnimating !== undefined) {
      Graph.getInstance().unFocus();
    }
  }, [isGraphAnimating]);
  useEffect(() => {
    if (focusedMatch && focusedTeam) {
      Graph.getInstance().drawOpponentMatch(focusedMatch, focusedTeam);
    } else {
      Graph.getInstance().removeOpponentCircle();
    }
  }, [focusedMatch, focusedTeam]);

  const __TEST__ = {
    graphData,
    setGraphData,
    visibilities,
    setVisibilities,
    focusedTeam,
    setFocusedTeam,
    isGraphAnimating,
    setIsGraphAnimating,
    focusedMatch,
    setFocusedMatch,
  };

  return { d3Canvas, __TEST__ };
};
