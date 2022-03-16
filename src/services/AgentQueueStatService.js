import { Manager } from "@twilio/flex-ui";
import { Actions } from "../states/AgentQueueStatState";

class AgentQueueStatService {
  #config = {
    workspaceStatsMapName: "realtime_statistics_v1",
    workspaceStatsKey: "workspace",
    queueMapName: "realtime_statistics.v1",
  };

  #syncClient;
  #manager;
  #workspaceStatsMap;
  #maps;

  constructor(manager) {
    this.#manager = manager;
    this.#syncClient = manager.insightsClient;
  }

  initializeQueueStats = async () => {
   
    try {
      this.#workspaceStatsMap = await this.#syncClient.map({
        id: this.#config.workspaceStatsMapName,
        mode: "open_existing",
      });

      this.#workspaceStatsMap.on("itemUpdated", (item) => {
        if (item.key === this.#config.workspaceStatsKey) {
          Manager.getInstance().store.dispatch(
            Actions.setWorkSpaceStats(workspaceStats)
          );
        }
      });
    } catch (error) {
      console.error(error);
    }
    try {
      // console.log("queues  -" + queues);
      const workspaceStats = await this.#workspaceStatsMap.get(
        this.#config.workspaceStatsKey
      );
      // console.log("workspacestat ----", workspaceStats);

      let queues = await this.fetchTRQueues();
      // console.log("queues-", queues);
      Manager.getInstance().store.dispatch(
        Actions.setWorkSpaceStats(workspaceStats.value)
      );

      this.#maps = await this.subQueueMaps(queues);
      // console.log("map ", this.#maps);

      this.#maps.forEach(async (map) => {
        const queue = this.findQueueByMap(map, queues);
        let page = await map.getItems();

        this.pageHandler(page, queue, this.queueStatItemUpdated);

        map.on("itemAdded", (item) => this.queueStatItemUpdated(queue, item.item));
        map.on("itemUpdated", (item) => { this.queueStatItemUpdated(queue, item.item)});
      });
    } catch (e) {
      console.error("error initializing sync maps ", e);
    }
  };

  findQueueByMap(map, queues) {
    const sid = map.uniqueName.split(".")[0];
    // console.log("map sid", sid);
    return queues?.find((q) => sid && q.queue_sid === sid);
  }

  queueStatItemUpdated = async (queue_meta, item) => {
    console.log(item);
    console.log(item.key);
    switch (item.key) {
      case "tasks_now": {
        let { queue, ...channels } = item.value;
          Manager.getInstance().store.dispatch(
          Actions.updateQueueStatsTasksNow(queue_meta, queue, channels)
        );
        break;
      }

      case "worker_activities_statistics": {
       // console.log("worker_activities_statistics --", item.value);
        Manager.getInstance().store.dispatch(
          Actions.updateWorkerActivitiesStats(queue_meta, item.value)
        );
        break;
      }

      case "tasks_thirty_minutes": {
        const { queue, ...channels } = item.value;
          Manager.getInstance().store.dispatch(
          Actions.updateQueueStatsTasksSla30Min(queue_meta, queue, channels)
        );
        break;
      }

      case "tasks_today": {
        const { queue, ...channels } = item.value;
        // console.log("sla_today ", queue);
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

  pageHandler = async (paginator, queue, handler) => {
    paginator.items.forEach(function (item) {
       handler(queue, item);
    });

    if (paginator.hasNextPage) {
      return paginator.nextPage().then(pageHandler);
    } else {
      return null;
    }
  };

  subQueueMaps = async (queues) => {
    let maps = [];
    maps = await queues.map(async (queue) => {
      // console.log("queue.queue_sid", queue.queue_sid);
      const mapId = `${queue.queue_sid}.${this.#config.queueMapName}`;
      const map = await this.#syncClient.map({
        id: mapId,
        mode: "open_existing",
      });

      return map;
    });

    const result = await Promise.all(maps);

    return result;
  };

  fetchTRQueues = async () => {
    let q = await this.#syncClient.liveQuery("tr-queue", "");

    // console.log("sync q - ",  JSON.stringify(q.getItems()));

    let result = Object.values(q.getItems()).map((i) => i);

    //console.log("queues ? ", result);
    return result;
  };

  subscribeToQueueStats = async () => {
    console.log("Unsubscribe to Queue Stats updates");
    this.initializeQueueStats();
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
}

const queueStatService = new AgentQueueStatService(Manager.getInstance());

export default queueStatService;
