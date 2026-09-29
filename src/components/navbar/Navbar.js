import { createElement } from '../../utils/dom.js';

export function Navbar() {
  return createElement(
    'nav',
    { className: 'navbar card' },
    createElement('a', { href: '/', className: 'navbar__brand' }, 'heyNotes'),
    createElement(
      'div',
      { className: 'navbar__links' },
      createElement('a', { href: '/', className: 'navbar__link' }, 'Inicio'),
      createElement('a', { href: '/notes', className: 'navbar__link' }, 'Notas'),
    ),
  );
}
