import { connect } from "react-redux";
import QueueStatsHelper from "../../helpers/QueueStatsHelper";
import AggregatedDataView from "./AggregatedDataView";
import {namespace} from "../../states"
const mapStateToProps = (state) => ({
  activeTasks: QueueStatsHelper.getActiveTasks(state[[namespace]].realtimeQueues.queuesList),
  waitingTasks: QueueStatsHelper.getWaitingTasks(state[[namespace]].realtimeQueues.queuesList), 
});

export default connect(mapStateToProps)(AggregatedDataView);