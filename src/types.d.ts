interface HotNodeModule extends NodeModule {
  hot: { accept: () => void };
}

declare var module: HotNodeModule;
