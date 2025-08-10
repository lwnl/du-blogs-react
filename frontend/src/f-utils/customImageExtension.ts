import Image from '@tiptap/extension-image';

// 扩展原有的 SetImageOptions，让它支持 data-placeholder
declare module '@tiptap/extension-image' {
  interface SetImageOptions {
    'data-placeholder'?: string;
  }
}

export const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      'data-placeholder': {
        default: null,
        renderHTML: (attributes: Record<string, any>) => {
          if (!attributes['data-placeholder']) {
            return {};
          }
          return {
            'data-placeholder': attributes['data-placeholder']
          };
        }
      }
    };
  }
});