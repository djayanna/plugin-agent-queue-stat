import React from "react";
import { Manager, VERSION, SideLink, Actions } from "@twilio/flex-ui";
import { FlexPlugin } from "@twilio/flex-plugin";

import AgentQueueStatView from "./components/AgentQueueStat";
import reducers, { namespace } from "./states";

const PLUGIN_NAME = "AgentQueueStatPlugin";

export default class AgentQueueStatPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  async init(flex, manager) {
    this.registerReducers(manager);   
    if (this.showAgentQueueStat(manager)) {
      flex.ViewCollection.Content.add(
        <flex.View name="agent-queues-stats" key="agent-queues-stats">
          <AgentQueueStatView />
        </flex.View>
      );

      flex.SideNav.Content.add(
        <SideLink
          key="agent-queues-stats"
          icon="Queues"
          iconActive="QueuesBold"
          onClick={() =>
            Actions.invokeAction("NavigateToView", {
              viewName: "agent-queues-stats",
            })
          }
        />,
        { sortOrder: 2 }
      );
    }
  }

  showAgentQueueStat(manager) {
    const { roles } = manager.user;
    return roles.indexOf("agent") >= 0;
  }

  /**
   * Registers the plugin reducers
   *
   * @param manager { Flex.Manager }
   */
  registerReducers(manager) {
    if (!manager.store.addReducer) {
      // eslint-disable-next-line
      console.error(
        `You need FlexUI > 1.9.0 to use built-in redux; you are currently on ${VERSION}`
      );
      return;
    }

    manager.store.addReducer(namespace, reducers);
  }
}
