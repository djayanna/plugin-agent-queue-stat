import { connect } from "react-redux";
import QueueStatsHelper from "../../helpers/QueueStatsHelper";
import AggregatedDataView from "./AggregatedDataView";

const mapStateToProps = (state) => ({
  activeTasks: QueueStatsHelper.getActiveTasks(state["agent-queue-stat"].realtimeQueues.queuesList),
  waitingTasks: QueueStatsHelper.getWaitingTasks(state["agent-queue-stat"].realtimeQueues.queuesList), 
});

export default connect(mapStateToProps)(AggregatedDataView);