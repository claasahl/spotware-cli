import Finity from 'finity';

enum State {
  created,
  accepted,
  filled,
  rejected,
  expired,
  closed,
  canceled
}

enum Event {
  accept,
  reject,
  fill,
  cancel,
  close,
  expire
}

const worker = Finity
  .configure<State, Event>()
    .initialState(State.created)
      .on(Event.accept).transitionTo(State.accepted)
      .on(Event.reject).transitionTo(State.rejected)
    .state(State.accepted)
      .on(Event.expire).transitionTo(State.expired)
      .on(Event.cancel).transitionTo(State.canceled)
      .on(Event.fill).transitionTo(State.filled)
    .state(State.filled)
      .on(Event.close).transitionTo(State.closed)
    .state(State.closed)
    .state(State.rejected)
    .state(State.expired)
    .state(State.canceled)
    .global()
      .onStateEnter(state => console.log(`Entering state '${State[state]}'`))
  .start();

worker.handle(Event.accept);
// worker.handle(Event.expire);

