import { clearElement } from '../utils/dom.js';

export class Router {
  constructor({ outlet, routes }) {
    this.outlet = outlet;
    this.routes = routes;
  }

  init() {
    window.addEventListener('popstate', () => this.render());
    this.render();
  }

  navigate(path) {
    window.history.pushState({}, '', path);
    this.render();
  }

  render() {
    const path = window.location.pathname;
    const route = this.routes[path] ?? this.routes['/404'];

    clearElement(this.outlet);
    this.outlet.append(route());
  }
}
