import { Manager } from "@twilio/flex-ui";
import { Actions } from "../states/AgentQueueStatState";

class AgentQueueStatService {
  #Config = {
    WORKSPACE_STATS_MAP_NAME: "realtime_statistics_v1",
    WORKSPACE_STATS_KEY: "workspace",
    QUEUE_MAP_NAME: "realtime_statistics.v1",
    TASK_QUEUE_INDEX: "tr-queue",
  };

  #QueueMapItemKeys = {
    TASKS_NOW: "tasks_now",
    WORKER_ACTIVITIES_STATISTICS: "worker_activities_statistics",
    TASKS_THIRTY_MINUTES: "tasks_thirty_minutes",
    TASKS_TODAY: "tasks_today",
  };

  #syncClient;
  #manager;
  #workspaceStatsMap;
  #maps;

  constructor(manager) {
    this.#manager = manager;
    this.#syncClient = manager.insightsClient;
  }

  subscribeToQueueStats = async () => {
    console.log("Unsubscribe to Queue Stats updates");
    this.#initializeQueueStats();
  };

  unsubscribeToQueueStats = async () => {
    console.log("Unsubscribe to Queue Stats updates");
    if (this.#maps && this.#maps.length) {
      this.#maps.forEach((map) => map.close());
    }

    if (this.#workspaceStatsMap) {
      this.#workspaceStatsMap.close();
    }
  };

  #initializeQueueStats = async () => {
    try {
    
    // Subscribe to workspace realtime stats
      this.#workspaceStatsMap = await this.#syncClient.map({
        id: this.#Config.WORKSPACE_STATS_MAP_NAME,
        mode: "open_existing",
      });

      this.#workspaceStatsMap.on("itemUpdated", (item) => {
        if (item.key === this.#Config.WORKSPACE_STATS_KEY) {
          Manager.getInstance().store.dispatch(
            Actions.setWorkSpaceStats(workspaceStats.value)
          );
        }
      });
    } catch (error) {
      console.error(`Error subscribing to ${this.#Config.WORKSPACE_STATS_MAP_NAME} `, error);
    }
    try {
    
       // Get workspace realtime stats 
      const workspaceStats = await this.#workspaceStatsMap.get(
        this.#Config.WORKSPACE_STATS_KEY
      );

      Manager.getInstance().store.dispatch(
        Actions.setWorkSpaceStats(workspaceStats.value)
      );

      // Get list of queues from 'tr-queue' index
      let queues = await this.#fetchTRQueues();
 
      // Get collection of queue realtime stats maps
      this.#maps = await this.#subQueueMaps(queues);

      // subscribe to queue maps
      this.#maps.forEach(async (map) => {
        const queue = this.#findQueueByMap(map, queues);
        let page = await map.getItems();

        this.#pageHandler(page, queue, this.#queueStatItemUpdated);

        map.on("itemAdded", (item) =>
          this.#queueStatItemUpdated(queue, item.item)
        );

        map.on("itemUpdated", (item) => {
          this.#queueStatItemUpdated(queue, item.item);
        });
      });
    } catch (e) {
      console.error("error initializing sync maps ", e);
    }
  };

  #findQueueByMap(map, queues) {
    const sid = map.uniqueName.split(".")[0];
    return queues?.find((q) => sid && q.queue_sid === sid);
  }

  #queueStatItemUpdated = async (queue_meta, item) => {
    switch (item.key) {
      case this.#QueueMapItemKeys.TASKS_NOW: {
        let { queue, ...channels } = item.value;
        Manager.getInstance().store.dispatch(
          Actions.updateQueueStatsTasksNow(queue_meta, queue, channels)
        );
        break;
      }

      case this.#QueueMapItemKeys.WORKER_ACTIVITIES_STATISTICS: {
        Manager.getInstance().store.dispatch(
          Actions.updateWorkerActivitiesStats(queue_meta, item.value)
        );
        break;
      }

      case this.#QueueMapItemKeys.TASKS_THIRTY_MINUTES: {
        const { queue, ...channels } = item.value;
        Manager.getInstance().store.dispatch(
          Actions.updateQueueStatsTasksSla30Min(queue_meta, queue, channels)
        );
        break;
      }

      case this.#QueueMapItemKeys.TASKS_TODAY: {
        const { queue, ...channels } = item.value;
        Manager.getInstance().store.dispatch(
          Actions.updateQueueStatsTasksSlaToday(queue_meta, queue, channels)
        );
        break;
      }

      default: {
        // no op
      }
    }
  };

  #pageHandler = async (paginator, queue, handler) => {
    paginator.items.forEach(function (item) {
      handler(queue, item);
    });

    if (paginator.hasNextPage) {
      return paginator.nextPage().then(pageHandler);
    } else {
      return null;
    }
  };

  #subQueueMaps = async (queues) => {
    let maps = [];
    maps = await queues.map(async (queue) => {
      const mapId = `${queue.queue_sid}.${this.#Config.QUEUE_MAP_NAME}`;
      const map = await this.#syncClient.map({
        id: mapId,
        mode: "open_existing",
      });

      return map;
    });

    const result = await Promise.all(maps);
    return result;
  };

  #fetchTRQueues = async () => {
    let q = await this.#syncClient.liveQuery(this.#Config.TASK_QUEUE_INDEX, "");
    let result = Object.values(q.getItems()).map((i) => i);
    return result;
  };
}

const queueStatService = new AgentQueueStatService(Manager.getInstance());

export default queueStatService;
