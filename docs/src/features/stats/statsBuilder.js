export function buildExerciseStats(entries) {
  const map = new Map();

  [...entries].reverse().forEach((entry) => {
    const date = entry.finishedAt || "";

    if (Array.isArray(entry.results)) {
      entry.results.forEach((result) => {
        addPoint(map, result.name, {
          date,
          value: sumNumbers(result.done),
          target: result.target,
          weight: parseWeight(result.weight || ""),
          sets: result.sets || result.done?.length || 0
        });
      });
      return;
    }

    entry.text.split("\n").forEach((line) => {
      const [name, value] = line.split(":");
      if (!name || !value) return;
      addPoint(map, name.trim(), {
        date,
        value: sumNumbers(value.match(/\d+/g) || []),
        target: value.trim(),
        weight: "",
        sets: 0
      });
    });
  });

  return [...map.entries()].map(([name, points]) => ({
    name,
    points,
    latest: points.at(-1)?.value || 0,
    previous: points.at(-2)?.value || 0,
    latestWeight: points.at(-1)?.weight || 0
  }));
}

function addPoint(map, name, point) {
  if (!map.has(name)) map.set(name, []);
  map.get(name).push(point);
}

function sumNumbers(values = []) {
  return values.reduce((sum, value) => {
    const number = Number(String(value).match(/\d+/)?.[0] || 0);
    return sum + number;
  }, 0);
}

function parseWeight(value) {
  const numbers = String(value).match(/\d+(?:[.,]\d+)?/g) || [];
  return numbers.reduce((max, item) => Math.max(max, Number(item.replace(",", ".")) || 0), 0);
}
