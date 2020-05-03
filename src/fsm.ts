import { createMachine, interpret, StateMachine } from '@xstate/fsm';
import * as B from "./services/base"



type Context = {};

type Event =
  | { type: 'ACCEPT', onSuccess?: () => void, onError?: () => void }
  | { type: 'REJECT', onSuccess?: () => void, onError?: () => void }
  | { type: 'FILL', onSuccess?: () => void, onError?: () => void }
  | { type: 'CLOSE', onSuccess?: () => void, onError?: () => void }
  | { type: 'CANCEL', onSuccess?: () => void, onError?: () => void }
  | { type: 'EXPIRE', onSuccess?: () => void, onError?: () => void }
  | { type: 'END', onSuccess?: () => void, onError?: () => void };

type State =
  | { value: 'created', context: B.OrderCreatedEvent }
  | { value: 'accepted', context: B.OrderAcceptedEvent }
  | { value: 'rejected', context: B.OrderRejectedEvent }
  | { value: 'filled', context: B.OrderFilledEvent }
  | { value: 'closed', context: B.OrderClosedEvent }
  | { value: 'canceled', context: B.OrderCanceledEvent }
  | { value: 'expired', context: B.OrderExpiredEvent }
  | { value: 'ended', context: B.OrderEndedEvent }

const machine = createMachine<Context, Event, State>({
  initial: "created",
  states: {
    created: {
      entry: ['emitCreated', 'success'],
      on: {
        ACCEPT: 'accepted',
        REJECT: 'rejected',
        CANCEL: 'canceled'
      }
    },
    accepted: {
      entry: ['emitAccepted', 'success'],
      on: {
        FILL: 'filled',
        CANCEL: 'canceled',
        EXPIRE: 'expired'
      }
    },
    rejected: {
      entry: ['emitRejected', 'success'],
      on: {
        REJECT: {actions: ['success']},
        END: 'ended'
      }
    },
    filled: {
      entry: ['emitFilled', 'success'],
      on: {
        CLOSE: 'closed'
      }
    },
    closed: {
      entry: ['emitClosed', 'success'],
      on: {
        END: 'ended'
      }
    },
    canceled: {
      entry: ['emitCanceled', 'success'],
      on: {
        END: 'ended'
      }
    },
    expired: {
      entry: ['emitExpired', 'success'],
      on: {
        END: 'ended'
      }
    },
    ended: {
      entry: ['emitEnded', 'success'],
    }
  }
},
  {
    actions: {
      emitCreated: (_context, event) => { console.log('created...', event); },
      emitAccepted: (_context, event) => { console.log('accepted...', event); },
      emitRejected: (_context, event) => { console.log('rejected...', event); },
      emitFilled: (_context, event) => { console.log('filled...', event); },
      emitClosed: (_context, event) => { console.log('closed...', event); },
      emitCanceled: (_context, event) => { console.log('canceled...', event); },
      emitExpired: (_context, event) => { console.log('expired...', event); },
      emitEnded: (_context, event) => { console.log('ended...', event); },
      success: (_context, event) => { if("onSuccess" in event && event.onSuccess) event.onSuccess(); },
      error: (_context, event) => { if("onError" in event && event.onError) event.onError(); },
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
  await ksdjfh(service, "END", "ended"); console.log(2)
  await ksdjfh(service, "END", "ended"); console.log(2)
}
main();