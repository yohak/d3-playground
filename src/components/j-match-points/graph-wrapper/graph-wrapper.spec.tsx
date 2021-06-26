import { RecoilRoot } from "recoil";
import { Graph, GraphData } from "../graph";
import { act, renderHook, cleanup } from "@testing-library/react-hooks";
import { useGraphWrapper } from "./graph-wrapper.hooks";
import React from "react";
import * as d3Utils from "../../../utils/d3";

describe("useGraphWrapper", () => {
  let graphMock: any;
  let wrapper: any;

  beforeEach(() => {
    wrapper = ({ children }: any) => <RecoilRoot>{children}</RecoilRoot>;
    graphMock = {
      init: jest.fn().mockImplementation(),
      drawLines: jest.fn().mockImplementation(),
      focus: jest.fn().mockImplementation(),
      unFocus: jest.fn().mockImplementation(),
      drawOpponentMatch: jest.fn().mockImplementation(),
      removeOpponentCircle: jest.fn().mockImplementation(),
    };
    jest.spyOn(Graph, "getInstance").mockReturnValue(graphMock);
  });
  it("should call destroy on unmount", () => {
    const destroySpy = jest.spyOn(d3Utils, "destroy").mockImplementation();
    const { result } = renderHook(() => useGraphWrapper(), { wrapper });
    expect(result.current.__TEST__.graphData).toBe(null);
    cleanup();
    expect(destroySpy).toHaveBeenCalled();
  });
  it("should call graph.init when graphData changes", () => {
    const { result } = renderHook(() => useGraphWrapper(), { wrapper });
    act(() => {
      const graphData: GraphData = { points: [] };
      result.current.__TEST__.setGraphData(graphData);
    });
    expect(graphMock.init).toHaveBeenCalled();
  });
  it("should call graph.drawLines when visibility changes with length", () => {
    const { result } = renderHook(() => useGraphWrapper(), { wrapper });
    act(() => {
      result.current.__TEST__.setVisibilities([{ team: "a", visible: true }]);
    });
    expect(graphMock.drawLines).toHaveBeenCalledTimes(1);
    act(() => {
      result.current.__TEST__.setVisibilities([]);
    });
    expect(graphMock.drawLines).toHaveBeenCalledTimes(1);
  });
});
