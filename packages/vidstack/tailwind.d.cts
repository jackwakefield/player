declare function plugin(options?: PluginOptions): {
  handler: () => void;
};

declare namespace plugin {
  const __isOptionsFunction: true;
}

export = plugin;

export interface PluginOptions {
  mediaPrefix?: string;
  sliderPrefix?: string;
}
