import path from "path";
import fs from "fs";
import { EOL } from "os";

import { Experiment } from "./experiment";

function experimentDir(experiment: Experiment) {
  return path.resolve(
    path.resolve(path.join(experiment.config.dir, experiment.id))
  );
}

export function createDirSync(experiment: Experiment): void {
  const dir = experimentDir(experiment);
  fs.mkdirSync(dir);
}

export function writeJsonSync(
  experiment: Experiment,
  name: string,
  value: any
): void {
  const dir = experimentDir(experiment);
  const filename = path.join(dir, name);
  fs.writeFileSync(filename, JSON.stringify(value, null, 2));
}

export function appendJsonSync(
  experiment: Experiment,
  name: string,
  value: any
): void {
  const dir = experimentDir(experiment);
  const filename = path.join(dir, name);
  fs.appendFileSync(filename, JSON.stringify(value, null, 2) + EOL);
}

export function readJsonSync(experiment: Experiment, name: string): any {
  const dir = experimentDir(experiment);
  const filename = path.join(dir, name);
  const content = fs.readFileSync(filename);
  return JSON.parse(content.toString());
}
