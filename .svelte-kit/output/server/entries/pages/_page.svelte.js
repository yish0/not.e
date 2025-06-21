import { f as sanitize_props, h as rest_props, j as spread_attributes, k as clsx$1, d as slot, l as bind_props, c as pop, p as push, m as head, e as escape_html } from "../../chunks/index.js";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { tv } from "tailwind-variants";
import { h as fallback } from "../../chunks/utils.js";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
function Button($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, ["variant", "size", "className"]);
  push();
  const buttonVariants = tv({
    base: "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: { variant: "default", size: "default" }
  });
  let variant = fallback($$props["variant"], "default");
  let size = fallback($$props["size"], "default");
  let className = fallback($$props["className"], "");
  $$payload.out += `<button${spread_attributes(
    {
      class: clsx$1(cn(buttonVariants({ variant, size }), className)),
      ...$$restProps
    }
  )}><!---->`;
  slot($$payload, $$props, "default", {});
  $$payload.out += `<!----></button>`;
  bind_props($$props, { variant, size, className });
  pop();
}
function Card($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, ["className"]);
  push();
  let className = fallback($$props["className"], "");
  $$payload.out += `<div${spread_attributes(
    {
      class: clsx$1(cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)),
      ...$$restProps
    }
  )}><!---->`;
  slot($$payload, $$props, "default", {});
  $$payload.out += `<!----></div>`;
  bind_props($$props, { className });
  pop();
}
function CardContent($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, ["className"]);
  push();
  let className = fallback($$props["className"], "");
  $$payload.out += `<div${spread_attributes(
    {
      class: clsx$1(cn("p-6 pt-0", className)),
      ...$$restProps
    }
  )}><!---->`;
  slot($$payload, $$props, "default", {});
  $$payload.out += `<!----></div>`;
  bind_props($$props, { className });
  pop();
}
function CardHeader($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, ["className"]);
  push();
  let className = fallback($$props["className"], "");
  $$payload.out += `<div${spread_attributes(
    {
      class: clsx$1(cn("flex flex-col space-y-1.5 p-6", className)),
      ...$$restProps
    }
  )}><!---->`;
  slot($$payload, $$props, "default", {});
  $$payload.out += `<!----></div>`;
  bind_props($$props, { className });
  pop();
}
function CardTitle($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, ["className"]);
  push();
  let className = fallback($$props["className"], "");
  $$payload.out += `<h3${spread_attributes(
    {
      class: clsx$1(cn("text-2xl font-semibold leading-none tracking-tight", className)),
      ...$$restProps
    }
  )}><!---->`;
  slot($$payload, $$props, "default", {});
  $$payload.out += `<!----></h3>`;
  bind_props($$props, { className });
  pop();
}
function _page($$payload, $$props) {
  push();
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>not.e - Enterprise Note Taking</title>`;
    $$payload2.out += `<meta name="description" content="Enterprise-level note-taking application"/>`;
  });
  $$payload.out += `<div class="flex flex-col items-center justify-center min-h-[80vh] space-y-8"><div class="text-center space-y-4"><h1 class="text-4xl font-bold tracking-tight">Welcome to not.e</h1> <p class="text-xl text-muted-foreground max-w-[600px]">Enterprise-level note-taking application built with Electron, SvelteKit, and shadcn/ui</p></div> `;
  Card($$payload, {
    class: "w-full max-w-md",
    children: ($$payload2) => {
      CardHeader($$payload2, {
        children: ($$payload3) => {
          CardTitle($$payload3, {
            children: ($$payload4) => {
              $$payload4.out += `<!---->Application Info`;
            },
            $$slots: { default: true }
          });
        },
        $$slots: { default: true }
      });
      $$payload2.out += `<!----> `;
      CardContent($$payload2, {
        class: "space-y-2",
        children: ($$payload3) => {
          {
            $$payload3.out += "<!--[!-->";
          }
          $$payload3.out += `<!--]--> `;
          {
            $$payload3.out += "<!--[!-->";
          }
          $$payload3.out += `<!--]--> <p><span class="font-medium">Mode:</span> ${escape_html("Browser")}</p>`;
        },
        $$slots: { default: true }
      });
      $$payload2.out += `<!---->`;
    },
    $$slots: { default: true }
  });
  $$payload.out += `<!----> <div class="flex gap-4">`;
  Button($$payload, {
    variant: "default",
    children: ($$payload2) => {
      $$payload2.out += `<!---->Get Started`;
    },
    $$slots: { default: true }
  });
  $$payload.out += `<!----> `;
  Button($$payload, {
    variant: "outline",
    children: ($$payload2) => {
      $$payload2.out += `<!---->Learn More`;
    },
    $$slots: { default: true }
  });
  $$payload.out += `<!----></div></div>`;
  pop();
}
export {
  _page as default
};
