import { createElement } from '../utils/dom.js';

export function NotFoundView() {
  return createElement(
    'section',
    { className: 'not-found-view' },
    createElement('h1', {}, 'Página no encontrada'),
    createElement('a', { href: '/', className: 'button-link' }, 'Volver al inicio'),
  );
}
