import * as d3 from "d3";
import Flatten from "@flatten-js/core";
import anime, { AnimeInstance } from "animejs";

type Point = Flatten.Point;
const Point = Flatten.Point;
type Vector = Flatten.Vector;
const Vector = Flatten.Vector;

type CanvasDragArgs = {
  initialPos: Flatten.Point;
  elm: HTMLElement;
  target: SVGGElement;
};

const mousePos: Point = new Point();
const prevPos: Point = new Point();
const canvasPos: Point = new Point();
const downPos: Point = new Point();

let dragInterval: number;
let mouseDownTime: number;
let canvas: SVGGElement;
let motion: AnimeInstance;
let isStartDrag: boolean;

export const setupCanvasDrag = ({
  elm,
  initialPos,
  target,
}: CanvasDragArgs) => {
  const bg = makeBg(target);
  setEvent(elm, bg);

  canvas = target;
  canvasPos.x = initialPos.x;
  canvasPos.y = initialPos.y;
  update(canvasPos);

  return () => {
    elm.removeEventListener("mousemove", setMousePos);
    elm.removeEventListener("mousedown", startDrag);
    elm.removeEventListener("mouseup", finishDrag);
    target = null;
  };
};

const makeBg = (target: SVGGElement): SVGRectElement => {
  return d3
    .select(target.parentElement)
    .insert("rect", ":first-child")
    .attr("fill", "white")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("style", "cursor:grab")
    .node();
};

const setEvent = (elm: HTMLElement, bg: SVGGElement) => {
  elm.addEventListener("mousemove", setMousePos);
  bg.addEventListener("mousedown", startDrag);
  bg.addEventListener("mouseup", finishDrag);
};

const setMousePos = (e: MouseEvent) => {
  mousePos.x = e.x;
  mousePos.y = e.y;
  setTimeout(() => {
    prevPos.x = e.x;
    prevPos.y = e.y;
  }, 100);
};

const startDrag = (e: MouseEvent) => {
  isStartDrag = true;
  motion?.pause();

  mouseDownTime = new Date().valueOf();

  downPos.x = e.x;
  downPos.y = e.y;
  dragInterval = window.setInterval(() => {
    const v: Vector = new Vector(downPos, mousePos);
    update(canvasPos.translate(v));
  });
};
const finishDrag = (e: MouseEvent) => {
  if (!isStartDrag) {
    return;
  }
  isStartDrag = false;
  const v: Vector = new Vector(downPos, mousePos);
  const newPos = canvasPos.translate(v);
  canvasPos.x = newPos.x;
  canvasPos.y = newPos.y;
  update(canvasPos);
  clearInterval(dragInterval);
  additionalMovement();
};

const additionalMovement = () => {
  const mouseUpTime = new Date().valueOf();
  const v: Vector = new Vector(prevPos, mousePos);
  const extraMovement = v.multiply(1 / (mouseUpTime - mouseDownTime));
  const targetPos = canvasPos.translate(extraMovement.multiply(500));
  motion?.pause();
  motion = anime({
    targets: canvasPos,
    x: targetPos.x,
    y: targetPos.y,
    easing: "easeOutCirc",
    duration: extraMovement.length * 1500,
    update: () => {
      update(canvasPos);
    },
  });
};

const update = (p: Point) => {
  canvas.setAttribute("transform", `translate(${p.x}, ${p.y})`);
};
