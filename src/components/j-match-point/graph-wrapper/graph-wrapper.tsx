import React, { FC } from "react";
import { Wrapper } from "./graph-wrapper.styles";
import { useGraphWrapper } from "./graph-wrapper.hooks";

export type GraphWrapperProps = {};

export const GraphWrapper: FC<GraphWrapperProps> = ({}) => {
  const { d3Canvas } = useGraphWrapper();
  return <Wrapper ref={d3Canvas} />;
};
