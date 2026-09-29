/**
 * Creates an HTML element with optional properties and children.
 * @param {string} tagName
 * @param {Object} properties
 * @param  {...(Node|string)} children
 * @returns {HTMLElement}
 */
export function createElement(tagName, properties = {}, ...children) {
  const element = document.createElement(tagName);

  Object.entries(properties).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key.startsWith('on') && typeof value === 'function') {
      element.addEventListener(key.substring(2).toLowerCase(), value);
    } else {
      element.setAttribute(key, value);
    }
  });

  children.flat().forEach((child) => {
    element.append(child instanceof Node ? child : document.createTextNode(child));
  });

  return element;
}

export function clearElement(element) {
  element.replaceChildren();
}
