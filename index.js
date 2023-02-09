const Table = require("cli-table");

const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

let frame = 0;

let scores = [
  { frame: 1, rolls: [], score: 0 },
  { frame: 2, rolls: [], score: 0 },
  { frame: 3, rolls: [], score: 0 },
  { frame: 4, rolls: [], score: 0 },
  { frame: 5, rolls: [], score: 0 },
  { frame: 6, rolls: [], score: 0 },
  { frame: 7, rolls: [], score: 0 },
  { frame: 8, rolls: [], score: 0 },
  { frame: 9, rolls: [], score: 0 },
  { frame: 10, rolls: [], score: 0 },
];

const generateScore = () => {
  scores.map((frame, index) => {
    if (index < 9) {
      // strike
      if (frame.rolls[0] === "X") {
        // 9h frame
        if (
          index === 8 &&
          frame.rolls[0] === "X" &&
          scores[index + 1]?.rolls.length > 1
        ) {
          frame.score =
            scores[index - 1]?.score +
            10 +
            (scores[9].rolls[0] === "X" ? 10 : scores[9].rolls[0]) +
            (scores[9].rolls[1] === ("X" || "/") ? 10 : scores[9].rolls[1]);
          // next frame isn't strike
        } else if (scores[index + 1].rolls.length === 2) {
          frame.score =
            (index > 0 ? scores[index - 1]?.score : 0) +
            10 +
            scores[index + 1].rolls[0] +
            (scores[index + 1].rolls[1] === "/"
              ? 10
              : scores[index + 1].rolls[1]);
          // next frame is strike
        } else if (
          scores[index + 1]?.rolls.length === 1 &&
          scores[index + 2]?.rolls.length > 0
        ) {
          frame.score =
            (index > 0 ? scores[index - 1]?.score : 0) +
            10 +
            10 +
            (scores[index + 2].rolls[0] === "X"
              ? 10
              : scores[index + 2].rolls[0]);
        }
        // spare
      } else if (
        frame.rolls[1] === "/" &&
        scores[index + 1].rolls.length === 1
      ) {
        frame.score =
          (index > 0 ? scores[index - 1]?.score : 0) +
          10 +
          (scores[index + 1].rolls[0] === "X"
            ? 10
            : scores[index + 1].rolls[0]);
        // normal
      } else if (frame.rolls?.length === 2 && frame.rolls[1] !== "/") {
        frame.score =
          (index > 0 ? scores[index - 1]?.score : 0) +
          frame.rolls[0] +
          frame.rolls[1];
      }
      // 10th frame
    } else {
      if (frame?.rolls.length > 1) {
        // spare
        if (frame.rolls[1] === "/" && frame.rolls[2]) {
          frame.score =
            scores[index - 1]?.score +
            10 +
            (frame.rolls[2] === "X" ? 10 : frame.rolls[2]);
          // strike
        } else if (frame.rolls?.filter((el) => el === "X")?.length > 0) {
          frame.score =
            scores[index - 1]?.score +
            frame.rolls.filter((el) => el === "X")?.length * 10 +
            frame.rolls?.filter((el) => el !== "X")?.reduce((a, b) => a + b, 0);
          // normal
        } else if (frame.rolls[1] !== "/") {
          frame.score =
            scores[index - 1]?.score + frame.rolls.reduce((a, b) => a + b, 0);
        }
      }
    }
  });
};

const sortTable = () => {
  generateScore();

  let table = new Table({
    head: ["Frame", "Frame score", "Total score"],
    colWidths: [10, 15, 15],
  });

  scores.forEach((frame) => {
    table.push([frame.frame, frame.rolls, frame.score]);
  });

  console.log(table.toString());
};

const recursiveReadLine = () => {
  readline.question("How many pins fell ? ", (firstPins) => {
    scores[frame].rolls.push(
      parseInt(firstPins) === 10 ? "X" : parseInt(firstPins)
    );

    sortTable();

    if (firstPins < 10 || (frame === 9 && scores[9].rolls.length < 3))
      readline.question("How many pins fell on roll 2 ? ", (secondPins) => {
        scores[frame].rolls.push(
          parseInt(secondPins) === 10
            ? "X"
            : parseInt(firstPins) + parseInt(secondPins) === 10
            ? "/"
            : parseInt(secondPins)
        );
        sortTable();
        frame < 9 && (frame = ++frame);
        frame === 9 &&
        scores[9].rolls.length === 2 &&
        !scores[9].rolls.includes("X") &&
        !scores[9].rolls.includes("/")
          ? readline.close()
          : recursiveReadLine();
      });
    else frame = ++frame;

    if (scores[9].rolls.length === 3) readline.close();
    else recursiveReadLine();
  });
};

recursiveReadLine();
