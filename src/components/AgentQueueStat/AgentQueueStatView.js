import * as React from 'react';

import AggregatedDataView from './AggregatedDataView.Container';
import queueStatService from '../../services/AgentQueueStatService';

class AgentQueueStatView extends React.Component {

    constructor(props) {
        super(props);
      }

      async componentDidMount() {
       await queueStatService.subscribeToQueueStats();
      }
    
      componentDidUpdate() {}
    
      componentWillUnmount() {
        queueStatService.unsubscribeToQueueStats();
      }

      render() {
        return (
          <div>
            <AggregatedDataView/>
          </div>
        );
      }
}

export default AgentQueueStatView;