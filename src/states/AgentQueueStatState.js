import produce from "immer";

const ACTION_SET_WORKSPACE_STATS = "SET_WORKSPACE_STATS";
const ACTION_UPDATE_QUEUE_STATS_TASKS_NOW = "UPDATE_QUEUE_STATS_TASKS_NOW";
const ACTION_UPDATE_WORKER_ACTIVITIES_STATS = "UPDATE_WORKER_ACTIVITIES_STATS";
const ACTION_UPDATE_QUEUE_STATS_TASKS_SLA_TODAY =
  "UPDATE_QUEUE_STATS_TASKS_SLA_TODAY";
const ACTION_UPDATE_QUEUE_STATS_TASKS_SLA_30_MIN =
  "UPDATE_QUEUE_STATS_TASKS_SLA_30_MIN";

const initialState = {
  workspaceStats: undefined,
  queuesList: {},
};

export class Actions {
  static setWorkSpaceStats = (value) => ({
    type: ACTION_SET_WORKSPACE_STATS,
    value,
  });
  static updateQueueStatsTasksNow = (queue_meta, queue, channel) => ({
    type: ACTION_UPDATE_QUEUE_STATS_TASKS_NOW,
    queue_meta,
    queue,
    channel,
  });
  static updateWorkerActivitiesStats = (queue_meta, queue) => ({
    type: ACTION_UPDATE_WORKER_ACTIVITIES_STATS,
    queue_meta,
    queue,
  });
  static updateQueueStatsTasksSlaToday = (queue_meta, queue, channel) => ({
    type: ACTION_UPDATE_QUEUE_STATS_TASKS_SLA_TODAY,
    queue_meta,
    queue,
    channel,
  });
  static updateQueueStatsTasksSla30Min = (queue_meta, queue, channel) => ({
    type: ACTION_UPDATE_QUEUE_STATS_TASKS_SLA_30_MIN,
    queue_meta,
    queue,
    channel,
  });
}

const updateQueueStatsTasksNow = produce((draft, queue_meta, queue, channel) => {

    draft.queuesList[queue_meta.queue_sid] = draft.queuesList[queue_meta.queue_sid] || {};
    const draft_queue = draft.queuesList[queue_meta.queue_sid];

    (draft_queue.key = queue_meta.queue_sid),
      (draft_queue.friendly_name = queue_meta.queue_name),
      (draft_queue.tasks_by_priority = queue.tasks_by_priority);

    draft_queue.tasks_by_status = {
      reserved: queue.reserved_tasks,
      pending: queue.pending_tasks,
      assigned: queue.assigned_tasks,
      wrapping: queue.wrapping_tasks,
    };
    draft_queue.total_tasks = queue.total_tasks;
    draft_queue.longest_task_waiting_sid = queue.longest_task_waiting_sid;
    draft_queue.longest_task_waiting_from = queue.longest_task_waiting_from;

    draft_queue.channels =  draft_queue.channels || {};  
    
    Object.keys(channel).forEach((key)=> {

      draft_queue.channels[key] =  draft_queue.channels[key] || {};
      draft_queue.channels[key].tasks_now = channel[key];

  });

  }
);

const updateWorkerActivitiesStats = produce((draft, queue_meta, queue) => {
  draft.queuesList[queue_meta.queue_sid] = draft.queuesList[queue_meta.queue_sid] || {};

  const draft_queue = draft.queuesList[queue_meta.queue_sid];
  draft_queue.total_available_workers = queue.total_available_workers;
  draft_queue.total_eligible_workers = queue.total_eligible_workers;
  draft_queue.activity_statistics = queue.activity_statistics;
});

const updateQueueStatsTasksSlaToday = produce((draft, queue_meta, queue, channel) => {
      draft.queuesList[queue_meta.queue_sid] = draft.queuesList[queue_meta.queue_sid] || {};
    
    const draft_queue = draft.queuesList[queue_meta.queue_sid];
    draft_queue.sla_today = queue;

    draft_queue.channels =  draft_queue.channels || {};  
    
    Object.keys(channel).forEach((key) => {

      draft_queue.channels[key] =  draft_queue.channels[key] || {};
      draft_queue.channels[key].sla_today = channel[key];
  });
  }
);

const updateQueueStatsTasksSla30Min = produce((draft, queue_meta, queue, channel) => {
  draft.queuesList[queue_meta.queue_sid] = draft.queuesList[queue_meta.queue_sid] || {};

    const draft_queue = draft.queuesList[queue_meta.queue_sid];
    draft_queue.sla_30_min = queue;
    draft_queue.channels =  draft_queue.channels || {};  
    
    Object.keys(channel).forEach((key) => {

      draft_queue.channels[key] =  draft_queue.channels[key] || {};
      draft_queue.channels[key].sla_30_min = channel[key];

  });
  }
);

export function reduce(state = initialState, action) {
  
  // eslint-disable-next-line sonarjs/no-small-switch
  switch (action.type) {
    case ACTION_SET_WORKSPACE_STATS: {
      return {
        ...state,
        workspaceStats: action.value,
      };
    }

    case ACTION_UPDATE_QUEUE_STATS_TASKS_NOW: {
      const { queue_meta, queue, channel } = action;
      return updateQueueStatsTasksNow(state, queue_meta, queue, channel);
    }

    case ACTION_UPDATE_WORKER_ACTIVITIES_STATS: {
      const { queue_meta, queue } = action;
      return updateWorkerActivitiesStats(state, queue_meta, queue);
    }

    case ACTION_UPDATE_QUEUE_STATS_TASKS_SLA_TODAY: {
      const { queue_meta, queue, channel } = action;
      return updateQueueStatsTasksSlaToday(state, queue_meta, queue, channel);
    }

    case ACTION_UPDATE_QUEUE_STATS_TASKS_SLA_30_MIN: {
      const { queue_meta, queue, channel } = action;
      return updateQueueStatsTasksSla30Min(state, queue_meta, queue, channel);
    }

    default:
      return state;
  }
}
