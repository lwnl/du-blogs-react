import { Node, mergeAttributes } from "@tiptap/core";
import type { CommandProps } from "@tiptap/core";

// -------- 关键：扩展 Commands 类型 --------
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    iframe: {
      setIframe: (options: { src: string }) => ReturnType;
    };
  }
}
// -----------------------------------------

const Iframe = Node.create({
  name: "iframe",

  group: "block",
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      frameborder: { default: 0 },
      allowfullscreen: { default: true },
    };
  },

  parseHTML() {
    return [{ tag: "iframe" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "iframe",
      mergeAttributes(HTMLAttributes, {
        class: "video-iframe",
        width: "560",
        height: "315",
      }),
    ];
  },

  addCommands() {
    return {
      setIframe:
        (options: { src: string }) =>
        ({ commands }: CommandProps) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});

export default Iframe;