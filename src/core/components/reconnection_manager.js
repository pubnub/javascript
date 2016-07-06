import TimeEndpoints from '../endpoints/time';
import { StatusAnnouncement } from '../flow_interfaces';

type ReconnectionManagerArgs = {
  timeEndpoints: TimeEndpoints
}

export default class {

  _reconnectionCallback: Function;
  _timeEndpoints: TimeEndpoints;
  _timeTimer: number;

  constructor({ timeEndpoints }: ReconnectionManagerArgs) {
    this._timeEndpoints = timeEndpoints;
  }

  onReconnection(reconnectionCallback: Function) {
    this._reconnectionCallback = reconnectionCallback;
  }

  startPolling() {
    this._timeTimer = setInterval(this._performTimeLoop.bind(this), 3000);
  }

  _performTimeLoop() {
    this._timeEndpoints.fetch((status: StatusAnnouncement) => {
      if (!status.error) {
        clearInterval(this._timeTimer);
        this._reconnectionCallback();
      }
    });
  }

}
