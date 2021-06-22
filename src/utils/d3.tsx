import * as d3 from "d3";

export const destroy = (elm: HTMLElement) => {
  d3.select(elm).selectAll("svg").remove();
};
