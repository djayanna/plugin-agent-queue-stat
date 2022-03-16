import { combineReducers } from 'redux';

import { reduce as AgentQueueStatReducer } from './AgentQueueStatState';

// Register your redux store under a unique namespace
export const namespace = 'agent-queue-stat';

// Combine the reducers
export default combineReducers({
  realtimeQueues: AgentQueueStatReducer,
});
