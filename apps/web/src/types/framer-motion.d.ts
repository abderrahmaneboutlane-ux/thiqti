declare module "framer-motion" {
  type MotionProps = Record<string, unknown>;
  type MotionComponent<K extends keyof JSX.IntrinsicElements> = React.ComponentType<
    JSX.IntrinsicElements[K] & MotionProps
  >;

  export const motion: {
    div: MotionComponent<"div">;
    button: MotionComponent<"button">;
    canvas: MotionComponent<"canvas">;
    circle: MotionComponent<"circle">;
    header: MotionComponent<"header">;
    h1: MotionComponent<"h1">;
    h2: MotionComponent<"h2">;
    h3: MotionComponent<"h3">;
    p: MotionComponent<"p">;
    span: MotionComponent<"span">;
    article: MotionComponent<"article">;
    table: MotionComponent<"table">;
    tr: MotionComponent<"tr">;
    td: MotionComponent<"td">;
    th: MotionComponent<"th">;
  };

  export const AnimatePresence: React.ComponentType<{
    children: React.ReactNode;
    mode?: "wait" | "sync" | "popLayout";
  }>;
}
