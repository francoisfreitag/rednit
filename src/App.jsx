import React, { useEffect, useRef, useState } from "react";
import "./App.css";

function shuffle(arr) {
  let cur = arr.length,
    randomIndex;

  while (cur) {
    randomIndex = Math.floor(Math.random() * cur);
    cur--;

    [arr[cur], arr[randomIndex]] = [arr[randomIndex], arr[cur]];
  }
}

function rotate(arr) {
  arr.push(arr.shift());
}

function evenRounds(teams) {
  const rounds = [];
  const carousel = [];
  for (let i = 1; i < teams.length; i++) {
    carousel.push(i);
  }
  for (let round = 0; round < teams.length - 1; round++) {
    // First player is fixed, rest of the players turn in circle.
    const carouselLast = carousel.length - 1;
    const currentRound = [[teams[0], teams[carousel[carouselLast]]]];
    // First round match is fixed, start at index 1.
    const lastFreeTeamIdx = carouselLast - 1;
    for (let i = 0; i < carousel.length / 2 - 1; i++) {
      const team1 = teams[carousel[i]];
      const team2 = teams[carousel[lastFreeTeamIdx - i]];
      currentRound.push([team1, team2]);
    }
    rounds.push(currentRound);
    rotate(carousel);
  }
  return rounds;
}

function oddRounds(teams) {
  /* Picture a polygon with all sides equal and teams.length vertices,
   * pointing up.
   * e.g. for 7 teams:
   *     2
   * 1  /_\ 3
   * 7 |___| 4
   * 6 \___/ 5
   * Create horizontal edges between each as in the diagram above.
   * First round: 1v3, 7v4, 6v5 (team 2 is idle).
   * Rotate the polygon 1/teams.length while keeping the edges in place.
   *     1
   * 7  /_\ 2
   * 6 |___| 3
   * 5 \___/ 4
   * Second round: 7v2, 6v3, 5v4 (1 is idle).
   * Etc.
   */
  if (teams.length === 1) {
    return [];
  }

  const rounds = [];
  const carousel = teams.slice();
  for (let i = 0; i < teams.length - 1; i++) {
    const currentRound = [];
    currentRound.push([carousel[0], carousel[2]]);
    const remainingPairCount = teams.length / 2 - 1;
    for (let j = 3; j < remainingPairCount + 3 - 1; j++) {
      const carouselEnd = carousel.length - 1;
      const matchingVertice = j - 3;
      currentRound.push([carousel[j], carousel[carouselEnd - matchingVertice]]);
    }
    rounds.push(currentRound);
    rotate(carousel);
  }
  return rounds;
}

function Rounds({ teams }) {
  const rounds = teams.length % 2 === 0 ? evenRounds(teams) : oddRounds(teams);
  return rounds.map((round, i) => (
    <React.Fragment key={round}>
      <h2>Round {i + 1}</h2>
      <div className="round">
        {round.map(([team1, team2], i) => (
          <React.Fragment key={i}>
            <b>{team1}</b>
            <small>VS</small>
            <b>{team2}</b>
          </React.Fragment>
        ))}
      </div>
    </React.Fragment>
  ));
}

function Textarea(props) {
  const ref = useRef();
  useEffect(() => {
    const textarea = ref.current;
    textarea.style.height = "inherit";
    const style = window.getComputedStyle(textarea);
    const height =
      parseInt(style.getPropertyValue("padding-top"), 10) +
      textarea.scrollHeight +
      parseInt(style.getPropertyValue("padding-bottom"), 10);
    textarea.style.height = `${height}px`;
  });
  return <textarea ref={ref} {...props} />;
}

function App() {
  const [value, setValue] = useState(() => {
    const savedData = localStorage.getItem("teams");
    try {
      return JSON.parse(savedData) || [];
    } catch (Error) {
      return [];
    }
  });
  const teams = value.filter(Boolean);
  useEffect(() => {
    localStorage.setItem("teams", JSON.stringify(value));
  });
  return (
    <>
      <header>
        <h1>Rednit</h1>
      </header>
      <label htmlFor="teams">
        Nom des joueurs <small>(Un par ligne)</small>
      </label>
      <Textarea
        id="teams"
        value={value.join("\n")}
        onChange={(e) => {
          setValue(e.target.value.split("\n"));
        }}
      />
      <button
        type="button"
        onClick={() => {
          const newValue = value.slice().filter(Boolean);
          shuffle(newValue);
          setValue(newValue);
        }}
      >
        Mélanger les équipes
      </button>
      <Rounds teams={teams} />
    </>
  );
}

export default App;
