import { isBefore, parseISO } from "date-fns";
import { transpose } from "../../utils/array";

export const processMatchStats = (allMatches: MatchData[]): TeamStats[] => {
  return extractTeamNames(allMatches)
    .map((team: string) => {
      const matches: MatchData[] = allMatches
        .filter((match) => match.homeTeam === team || match.awayTeam === team)
        .sort((a, b) => {
          const dateA = parseISO(
            a.date.length === 5 ? `${a.date}12-31` : a.date
          );
          const dateB = parseISO(
            b.date.length === 5 ? `${b.date}12-31` : b.date
          );
          return isBefore(dateA, dateB) ? -1 : 1;
        })
        .map((match, i) => ({ ...match, index: i }));
      const pt: number[] = matches.map((match) => getMatchPoint(match, team));
      const mp: number[] = pt.reduce((prev: number[], current: number) => {
        if (prev.length) {
          return current !== null
            ? [...prev, [...prev].pop() + current]
            : [...prev];
        } else {
          return [current];
        }
      }, []);
      const goals: [number, number][] = matches
        .map((r) => getGoals(r, team))
        .filter((r) => !!r);
      const gf: number[] = goals.reduce(
        (prev: number[], [goalFor, goalAgainst]: [number, number]) => {
          if (prev.length) {
            return [...prev, [...prev].pop() + goalFor];
          } else {
            return [goalFor];
          }
        },
        []
      );
      const ga: number[] = goals.reduce(
        (prev: number[], [goalFor, goalAgainst]: [number, number]) => {
          if (prev.length) {
            return [...prev, [...prev].pop() + goalAgainst];
          } else {
            return [goalAgainst];
          }
        },
        []
      );
      const gd: number[] = goals.reduce(
        (prev: number[], [goalFor, goalAgainst]: [number, number]) => {
          if (prev.length) {
            return [...prev, [...prev].pop() + goalFor - goalAgainst];
          } else {
            return [goalFor - goalAgainst];
          }
        },
        []
      );
      return { team, pt: mp, matches, gf, ga, gd };
    })
    .sort((a, b) => {
      const va = [...a.pt].pop();
      const vb = [...b.pt].pop();
      const ga = [...a.gd].pop();
      const gb = [...b.gd].pop();
      if (vb !== va) {
        return vb - va;
      } else {
        return gb - ga;
      }
    });
};

export const getMatchPoint = (match: MatchData, team: string): number => {
  if (match.homeScore === null || match.awayScore === null) {
    return null;
  }
  if (match.homeTeam !== team && match.awayTeam !== team) {
    console.warn(`"${team}" is not found on this match`, match);
    return 0;
  }
  switch (true) {
    case match.homeScore > match.awayScore:
      return match.homeTeam === team ? 3 : 0;
    case match.homeScore < match.awayScore:
      return match.homeTeam === team ? 0 : 3;
    case match.homeScore === match.awayScore:
      return 1;
  }
};

export const findBorderLine = (
  data: MatchData[],
  threthold: number
): number[] => {
  const stats = processMatchStats(data);
  const points = stats
    .map((r) => r.pt)
    .map((arr) => {
      return arr;
    });
  // const pt = ;
  const maxLength = Math.max(...points.map((r) => r.length));
  const pointsFilled = points.map((arr) => {
    const result = [...arr];
    const last = result.pop();
    while (result.length < maxLength) {
      result.push(last);
    }
    return result;
  });
  const transposed = transpose(pointsFilled).map((arr) =>
    arr.sort((a, b) => b - a)
  );
  return transposed.map((arr) => arr[threthold - 1]);
};

const getGoals = (match: MatchData, team: string): [number, number] => {
  if (match.homeScore === null || match.awayScore === null) {
    return null;
  }
  if (match.homeTeam !== team && match.awayTeam !== team) {
    console.warn(`"${team}" is not found on this match`, match);
    return [0, 0];
  }
  if (match.homeTeam === team) {
    return [match.homeScore, match.awayScore];
  } else {
    return [match.awayScore, match.homeScore];
  }
};

const extractTeamNames = (matches: MatchData[]): string[] => {
  return matches
    .map((r) => r.awayTeam)
    .reduce((accum: string[], current: string) => {
      if (accum.find((str) => str === current)) {
        return [...accum];
      } else {
        return [...accum, current];
      }
    }, []);
};

export const findCircleInfo = (
  match: MatchData,
  team: string,
  data: TeamStats[]
): CirclePosition => {
  const teamStats = data.find((r) => r.team === team);
  if (!teamStats) {
    console.error("no team stats found", match, team, data);
    return { team, index: 0, pt: 0 };
  }
  const opponentMatch = teamStats.matches.find(
    (r) =>
      r.series === match.series &&
      r.homeTeam === match.homeTeam &&
      r.awayTeam === match.awayTeam
  );
  const index = teamStats.matches.indexOf(opponentMatch);
  const pt = teamStats.pt[index];
  return { team, index, pt };
};

export const findOpponentTeam = (match: MatchData, myTeam: string): string => {
  switch (true) {
    case match.homeTeam === myTeam:
      return match.awayTeam;
    case match.awayTeam === myTeam:
      return match.homeTeam;
    default:
      return null;
  }
};

export const __TEST__ = { getMatchPoint };

export type MatchData = {
  series: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  date: string;
};

export type CirclePosition = {
  index: number;
  pt: number;
  team: string;
};

export type TeamStats = {
  team: string;
  pt: number[];
  gf: number[];
  ga: number[];
  gd: number[];
  matches: MatchData[];
};
