import { atom } from "recoil";
import { GraphData } from "./logic/graph";
import { MatchData } from "./logic/process-data";

export const graphDataState = atom<GraphData>({
  key: "graphDataState",
  default: null,
});

export type Visibility = {
  visible: boolean;
  team: string;
};

export const visibilityState = atom<Visibility[]>({
  key: "visibilityState",
  default: [],
});

export const focusedTeamState = atom<string>({
  key: "focusedTeamState",
  default: null,
});

export const focusedMatchState = atom<MatchData>({
  key: "focusedMatchState",
  default: null,
});

export const isGraphAnimatingState = atom<boolean>({
  key: "isGraphAnimating",
  default: false,
});
