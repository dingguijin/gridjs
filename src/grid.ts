import { Config, UserConfig } from './config';
import { h, render, VNode } from 'preact';
import { Container } from './view/container';
import log from './util/log';
import { EventEmitter } from './util/eventEmitter';

class Grid extends EventEmitter<any> {
  public config: Config;

  constructor(userConfig?: UserConfig) {
    super();

    this.config = new Config().update(userConfig);

    // we use this to send the dispatcher events to the end-users
    // it's just a nice abstraction layer
    this.config.dispatcher.register(action => {
      this.emit(action.type, action.payload);
    });
  }

  public updateConfig(userConfig: Partial<UserConfig>): this {
    this.config.update(userConfig);
    return this;
  }

  createElement(): VNode {
    return h(Container, {
      config: this.config,
      pipeline: this.config.pipeline,
      header: this.config.header,
      width: this.config.width,
    });
  }

  /**
   * Uses the existing container and tries to clear the cache
   * and re-render the existing Grid.js instance again. This is
   * useful when a new config is set/updated.
   *
   */
  forceRender(): this {
    if (!this.config || !this.config.container) {
      log.error(
        'Container is empty. Make sure you call render() before forceRender()',
        true,
      );
    }

    // clear the pipeline cache
    this.config.pipeline.clearCache();

    // TODO: not sure if it's a good idea to render a null element but I couldn't find a better way
    render(null, this.config.container);
    render(this.createElement(), this.config.container);

    return this;
  }

  /**
   * Mounts the Grid.js instance to the container
   * and renders the instance
   *
   * @param container
   */
  render(container: Element): this {
    if (!container) {
      log.error('Container element cannot be null', true);
    }

    if (container.childNodes.length > 0) {
      log.error(
        `The container element ${container} is not empty. Make sure the container is empty and call render() again`,
      );
      return this;
    }

    this.config.container = container;
    render(this.createElement(), container);

    return this;
  }
}

export default Grid;
