import { Events, SpotEvent } from "../events";

export interface Options {
  events: Events;
  spots: SpotEvent[];
}

export async function macro(options: Options): Promise<void> {
  const { events, spots } = options;
  spots.forEach((e) => events.emit("spot", e));
}
