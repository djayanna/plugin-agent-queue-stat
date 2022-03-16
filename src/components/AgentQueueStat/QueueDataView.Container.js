import { connect } from "react-redux";
import QueueStatsHelper from "../../helpers/QueueStatsHelper";
import QueueDataView from "./QueueDataView";

const mapStateToProps = (state) => ({
  queueList: state["agent-queue-stat"].realtimeQueues.queuesList
});

export default connect(mapStateToProps)(QueueDataView);