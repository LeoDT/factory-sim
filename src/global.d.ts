interface HotNodeModule extends NodeModule {
  hot: { accept: () => void };
}

declare var module: HotNodeModule;

declare type Vector2 = [number, number];
