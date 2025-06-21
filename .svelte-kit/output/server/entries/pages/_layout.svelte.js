import { d as slot } from "../../chunks/index.js";
function _layout($$payload, $$props) {
  $$payload.out += `<main class="container mx-auto px-4 py-8"><!---->`;
  slot($$payload, $$props, "default", {});
  $$payload.out += `<!----></main>`;
}
export {
  _layout as default
};
