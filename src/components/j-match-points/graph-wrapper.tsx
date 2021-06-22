import React, { FC, useEffect, useRef } from "react";
import styled from "styled-components";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  focusedMatchState,
  focusedTeamState,
  graphDataState,
  isGraphAnimatingState,
  visibilityState,
} from "./atoms";
import { Graph } from "./logic/graph";
import { destroy } from "../../utils/d3";

export type GraphWrapperProps = {};

export const GraphWrapper: FC<GraphWrapperProps> = ({}) => {
  const graphData = useRecoilValue(graphDataState);
  const visibilities = useRecoilValue(visibilityState);
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
    if (focusedTeam) {
      if (!isGraphAnimating) {
        Graph.getInstance().focus(focusedTeam);
      }
    } else {
      Graph.getInstance().unFocus();
    }
  }, [focusedTeam]);
  useEffect(() => {
    Graph.getInstance().unFocus();
  }, [isGraphAnimating]);
  useEffect(() => {
    if (focusedMatch && focusedTeam) {
      Graph.getInstance().drawOpponentMatch(focusedMatch, focusedTeam);
    } else {
      Graph.getInstance().removeOpponentCircle();
    }
  }, [focusedMatch]);

  return <Wrapper ref={d3Canvas} />;
};

const Wrapper = styled.div`
  height: 100%;
  @keyframes dash {
    to {
      stroke-dashoffset: -80;
    }
  }

  .graph-cover {
    opacity: 0;
    pointer-events: none;
    transition-duration: 0.3s;
    transition-property: opacity;
    transition-timing-function: ease-in-out;

    &.active {
      opacity: 0.8;
    }
  }

  .line-group {
    cursor: pointer;
    path.dashed {
      pointer-events: none;
    }

    &.active {
      path.dashed {
        animation-name: dash;
        animation-duration: 2000ms;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
      }
    }

    &.inactive {
    }
  }
`;
