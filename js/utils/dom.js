export const $ = (sel, root=document) => root.querySelector(sel);
export const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
export function el(tag, props={}, children=[]) {
  const node = Object.assign(document.createElement(tag), props);
  for (const c of [].concat(children)) node.append(c);
  return node;
}
export function show(node, yes=true) { node.classList.toggle("hidden", !yes); }
