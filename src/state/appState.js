import { storage } from '../utils/storage.js';

const DEFAULT_STATE = {
  theme: 'light',
  sidebarOpen: true,
};

let state = {
  ...DEFAULT_STATE,
  ...storage.get('app-state', {}),
};

const listeners = new Set();

export function getState() {
  return { ...state };
}

export function setState(partialState) {
  state = { ...state, ...partialState };
  storage.set('app-state', state);
  listeners.forEach((listener) => listener(getState()));
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
