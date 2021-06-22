import * as d3 from "d3";
import {
  findCircleInfo,
  findOpponentTeam,
  MatchData,
  TeamStats,
} from "./process-data";
import { COLOR_BG1, ColorInfo, teamColors } from "../consts";
import { Margin } from "../../../utils/geom/margin";
import { Area } from "../../../utils/geom/area";
import { Visibility } from "../atoms";
import { insertBefore } from "../../../utils/dom";

export type BorderArea = {
  top: number[] | true;
  bottom: number[] | true;
  color: string;
};

export type GraphData = {
  points: TeamStats[];
  aclLine?: BorderArea;
  promotionLine?: BorderArea;
  relegationLine?: BorderArea;
  playoffLine?: BorderArea;
};
type CircleData = { match: MatchData; stats: TeamStats };

type D3Selection = d3.Selection<any, any, any, any>;
type D3SelectionWidthTeamStats = d3.Selection<any, TeamStats, any, any>;
type D3SelectionWidthCircleData = d3.Selection<any, CircleData, any, any>;
type D3ScaleLinear = d3.ScaleLinear<number, number>;
type Transition = d3.Transition<any, any, any, any>;

const LINE_WIDTH: number = 2;
const margin: Margin = new Margin(20, 20, 30, 60);

export type GraphInitOpts = {
  elm: HTMLElement;
  data: GraphData;
  setFocusedTeam: (str: string) => void;
  setIsGraphAnimating: (value: boolean) => void;
  setFocusedMatch: (match: MatchData) => void;
};
export class Graph {
  private static instance: Graph;
  private constructor() {}
  static getInstance(): Graph {
    if (!Graph.instance) {
      Graph.instance = new Graph();
    }
    return Graph.instance;
  }

  private svg: D3Selection;
  private scaleX: D3ScaleLinear;
  private scaleY: D3ScaleLinear;
  private data: GraphData;

  private lineWrapper: D3Selection;
  private setFocusedTeam: (str: string) => void;
  private setAnimating: (value: boolean) => void;
  private setFocusedMatch: (match: MatchData) => void;

  public init(opts: GraphInitOpts) {
    this.data = opts.data;
    if (!this.data) {
      console.log("no data found");
      return;
    }
    this.setFocusedTeam = opts.setFocusedTeam;
    this.setAnimating = opts.setIsGraphAnimating;
    this.setFocusedMatch = opts.setFocusedMatch;
    const { points } = this.data;
    const elmRect = opts.elm.getBoundingClientRect();
    this.svg = d3.select(opts.elm).append("svg");
    this.svg.attr("viewBox", `${[0, 0, elmRect.width, elmRect.height]}`);
    const area = new Area(elmRect.width, elmRect.height, margin);
    const bg = this.svg.append("g");
    bg.append("rect")
      .attr("fill", COLOR_BG1)
      .attr("width", area.width)
      .attr("height", area.height)
      .attr("x", margin.left)
      .attr("y", margin.right);

    const maxMatches = Math.max(...points.map((item) => item.pt.length)) + 0.5;
    const maxPoints = Math.max(...points.map((item) => [...item.pt].pop())) + 1;
    this.scaleX = d3
      .scaleLinear()
      .domain([0, maxMatches])
      .range([0, area.width]);
    this.scaleY = d3
      .scaleLinear()
      .domain([0, maxPoints])
      .range([area.height, 0]);

    this.lineWrapper = this.svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const graphCover = this.svg
      .append("rect")
      .classed("graph-cover", true)
      .attr("style", "pointer-events:none")
      .attr("id", "graphCover")
      .attr("fill", COLOR_BG1)
      .attr("width", area.width)
      .attr("height", area.height);

    const axisGroup = this.svg.append("g");
    const axisGroupX = axisGroup
      .append("g")
      .attr(
        "transform",
        `translate(${margin.left},${area.height + margin.top})`
      );
    const axisCallX = d3.axisBottom(this.scaleX);
    axisGroupX.call(axisCallX);
    const axisGroupY = axisGroup
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    const axisCallY = d3.axisLeft(this.scaleY);
    axisGroupY.call(axisCallY).attr("fill");
  }

  public drawLines(visibilities: Visibility[]) {
    if (!this.data) {
      return;
    }
    const { points } = this.data;
    const drawData: TeamStats[] = points
      .filter((item) => visibilities.find((v) => v.team === item.team).visible)
      .reverse();
    const transition: Transition = this.svg
      .transition()
      .duration(1000)
      .ease(d3.easeExpOut)
      .on("start", () => {
        this.setAnimating(true);
      })
      .on("end", () => {
        this.setAnimating(false);
      });
    const line: D3SelectionWidthTeamStats = this.lineWrapper
      .selectAll<SVGGElement, TeamStats>("g")
      .data(drawData, (d) => d.team);

    const lineEnter: D3SelectionWidthTeamStats = line
      .enter()
      .append("g")
      .attr("id", (d) => `g-${d.team}`)
      .attr("class", `line-group`)
      .on("mouseover", (e: MouseEvent, data) => {
        this.setFocusedTeam(data.team);
      })
      .on("mouseleave", (e: MouseEvent, data) => {
        this.setFocusedTeam(null);
      });

    lineEnter
      .append("path")
      .classed("line-base", true)
      .attr("stroke", (d) => findColor(d.team).color1)
      .attr("fill", "none")
      .attr("stroke-width", LINE_WIDTH)
      .attr("style", "cursor:pointer")
      .attr("d", (d) => drawPath(d.pt, this.scaleX, this.scaleY, true));

    lineEnter
      .append("path")
      .classed("dashed", true)
      .attr("stroke", (d) => findColor(d.team).color2)
      .attr("stroke-dasharray", `${[8, 8]}`)
      .attr("fill", "none")
      .attr("stroke-width", LINE_WIDTH)
      .attr("d", (d) => drawPath(d.pt, this.scaleX, this.scaleY, true));

    const lineUpdate = line.merge(lineEnter).transition(transition);
    lineUpdate
      .select("path.line-base")
      .attr("d", (d) => drawPath(d.pt, this.scaleX, this.scaleY));
    lineUpdate
      .select("path.dashed")
      .attr("d", (d) => drawPath(d.pt, this.scaleX, this.scaleY));

    const lineExit = line.exit<TeamStats>().transition(transition).remove();
    lineExit
      .select("path.line-base")
      .attr("d", (d) => drawPath(d.pt, this.scaleX, this.scaleY, true));
    lineExit
      .select("path.dashed")
      .attr("d", (d) => drawPath(d.pt, this.scaleX, this.scaleY, true));

    const circle = lineEnter.selectAll("circle").data<CircleData>((s) =>
      s.matches
        .filter((match) => match.homeScore !== null)
        .map((match) => ({
          match,
          stats: s,
        }))
    );
    const circleEnter: D3SelectionWidthCircleData = circle
      .enter()
      .append("circle")
      .attr("fill", (d) => findColor(d.stats.team).color2)
      .attr("stroke", (d) => findColor(d.stats.team).color1)
      .attr("stroke-width", 1.5)
      .attr("r", 4)
      .attr("cx", (d, i) => this.scaleX(i + 1))
      .attr("cy", (d, i) => this.scaleY(0))
      .on("mouseover", (e, d) => {
        this.setFocusedMatch(d.match);
      })
      .on("mouseleave", (e, d) => {
        this.setFocusedMatch(null);
      });
    circle
      .merge(circleEnter)
      .transition(transition)
      .attr("cx", (d, i) => this.scaleX(i + 1))
      .attr("cy", (d, i) => this.scaleY(d.stats.pt[i]));
    lineExit
      .selectAll("circle")
      .attr("cx", (d, i) => this.scaleX(i + 1))
      .attr("cy", (d, i) => this.scaleY(0));
  }

  public focus(team: string) {
    const cover = document.querySelector("#graphCover");
    const target = document.querySelector(`#g-${team}`);
    const parent = target.parentElement;
    parent.append(cover);
    parent.append(target);
    setTimeout(() => {
      cover.classList.add("active");
    }, 16);

    this.lineWrapper
      .selectAll("g")
      .classed("active", (d) => (d as TeamStats).team === team)
      .classed("inactive", (d) => (d as TeamStats).team !== team);
  }

  public unFocus() {
    const cover = document.querySelector("#graphCover");
    if (!cover) {
      return;
    }
    cover.classList.remove("active");
    setTimeout(() => {
      cover.classList.remove("active");
    }, 16);
    this.lineWrapper
      .selectAll("g")
      .classed("active", false)
      .classed("inactive", false);
  }

  public drawOpponentMatch(focusedMatch: MatchData, focusedTeam: string) {
    const myCircleInfo = findCircleInfo(
      focusedMatch,
      focusedTeam,
      this.data.points
    );
    const targetTeam = findOpponentTeam(focusedMatch, focusedTeam);
    const targetCircle = findCircleInfo(
      focusedMatch,
      targetTeam,
      this.data.points
    );
    if (
      myCircleInfo.pt === targetCircle.pt &&
      myCircleInfo.index === targetCircle.index
    ) {
      return;
    }
    const circle: D3Selection = this.lineWrapper
      .append("circle")
      .attr("fill", () => findColor(targetCircle.team).color2)
      .attr("stroke", () => findColor(targetCircle.team).color1)
      .attr("stroke-width", 1.5)
      .attr("r", 6)
      .attr("cx", () => this.scaleX(targetCircle.index + 1))
      .attr("cy", () => this.scaleY(targetCircle.pt))
      .classed("opponent-circle", true);
    const circleEnter = circle.enter().attr("opacity", 0);
    const circleUpdate = circle
      .merge(circleEnter)
      .transition()
      .duration(500)
      .attr("opacity", 1);
    //
    const targetLine = document.querySelector(`#g-${targetCircle.team}`);
    const graphCover = document.querySelector("#graphCover");
    insertBefore(targetLine, graphCover);
  }
  public removeOpponentCircle() {
    if (!this.lineWrapper) {
      return;
    }
    const circle = this.lineWrapper.selectAll(".opponent-circle");
    circle.transition().duration(100).attr("opacity", 0).remove();
  }
}

const drawPath = (
  data: number[],
  scaleX: D3ScaleLinear,
  scaleY: D3ScaleLinear,
  isStart: boolean = false
): string => {
  const path = d3.path();
  path.moveTo(scaleX(0), scaleY(0));
  data.forEach((d, i) => {
    path.lineTo(scaleX(i + 1), isStart ? scaleY(0) : scaleY(d));
  });

  return path.toString();
};

const findColor = (team: string): ColorInfo => {
  const info: ColorInfo = teamColors.find((r) => r.team === team);
  if (info) {
    return info;
  }
  console.warn("no color info found:", team);
  return { color1: "#000000", color2: "#000000", team };
};
