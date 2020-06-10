import { createMachine, interpret, StateMachine } from '@xstate/fsm';
import * as T from "./services/types"



type Context = {};

type Event =
  | { type: 'ACCEPT' }
  | { type: 'REJECT' }
  | { type: 'FILL' }
  | { type: 'CLOSE' }
  | { type: 'CANCEL' }
  | { type: 'EXPIRE' };

type State =
  | { value: 'created', context: T.OrderCreatedEvent }
  | { value: 'accepted', context: T.OrderAcceptedEvent }
  | { value: 'rejected', context: T.OrderRejectedEvent }
  | { value: 'filled', context: T.OrderFilledEvent }
  | { value: 'closed', context: T.OrderClosedEvent }
  | { value: 'canceled', context: T.OrderCanceledEvent }
  | { value: 'expired', context: T.OrderExpiredEvent }

const machine = createMachine<Context, Event, State>({
  initial: "created",
  states: {
    created: {
      on: {
        ACCEPT: 'accepted',
        REJECT: 'rejected',
        CANCEL: 'canceled'
      }
    },
    accepted: {
      on: {
        FILL: 'filled',
        CANCEL: 'canceled',
        EXPIRE: 'expired'
      }
    },
    filled: {
      on: {
        CLOSE: 'closed'
      }
    },
    rejected: {},
    closed: {},
    canceled: {},
    expired: {}
  }
});

async function ksdjfh(service: StateMachine.Service<Context, Event, State>, type: Event['type'], goal: State['value']): Promise<void> {
  service.send(type)
  console.log(service.state.value)
  if(service.state.changed) {
      console.log("magic did happen (1)")
  } else if(service.state.value === goal) {
      console.log("magic did happen (2)")
  }
  throw new Error(`did not change state`)
}

async function main() {
  const service = interpret(machine);
  service.start();
  await ksdjfh(service, "REJECT", "rejected"); console.log(2)
  await ksdjfh(service, "REJECT", "rejected"); console.log(2)
}
main();