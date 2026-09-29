import { createElement } from '../../utils/dom.js';

export function Footer() {
  return createElement(
    'footer',
    { className: 'footer' },
    createElement('p', {}, `© ${new Date().getFullYear()} heyNotes`),
  );
}
