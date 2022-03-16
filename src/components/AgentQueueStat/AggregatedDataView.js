import {
  AggregatedDataTile
} from "@twilio/flex-ui-core";

import {
    Table,
    TableBody,
    TableRow,
    TableCell,
  } from "@material-ui/core";

class AggregatedDataView extends React.Component {

    constructor(props) {
        super(props);
      }

  render() {
      const {activeTasks, waitingTasks} = this.props;
    return (
      <div>
        <Table>
          <TableBody>
              <TableRow>
            <TableCell>
            <AggregatedDataTile title="Active Tasks" content={activeTasks.toString()} />
            </TableCell>
            <TableCell>
              <AggregatedDataTile title="Waiting Tasks" content={waitingTasks.toString()} />
            </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }
}

export default AggregatedDataView;
