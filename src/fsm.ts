import { createMachine, interpret, StateMachine } from '@xstate/fsm';
import * as B from "./services/base"



type Context = {};

type Event =
  | { type: 'ACCEPT' }
  | { type: 'REJECT' }
  | { type: 'FILL' }
  | { type: 'CLOSE' }
  | { type: 'CANCEL' }
  | { type: 'EXPIRE' };

type State =
  | { value: 'created', context: B.OrderCreatedEvent }
  | { value: 'accepted', context: B.OrderAcceptedEvent }
  | { value: 'rejected', context: B.OrderRejectedEvent }
  | { value: 'filled', context: B.OrderFilledEvent }
  | { value: 'closed', context: B.OrderClosedEvent }
  | { value: 'canceled', context: B.OrderCanceledEvent }
  | { value: 'expired', context: B.OrderExpiredEvent }

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

// console.log("----->", service.send({type: "END", cb: () => {}}));
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
// async function ksdjfh(service: StateMachine.Service<Context, Event, State>, type: Event['type']): Promise<void> {
//   await new Promise<void>((resolve, reject) => {
//     service.send({ type, onSuccess: resolve, onError: reject })
//   })
//   console.log("magic did happen")
// }
async function main() {
  const service = interpret(machine);
  service.start();
  await ksdjfh(service, "REJECT", "rejected"); console.log(2)
  await ksdjfh(service, "REJECT", "rejected"); console.log(2)
}
main();