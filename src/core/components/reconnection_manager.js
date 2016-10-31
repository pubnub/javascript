import TimeEndpoint from '../endpoints/time';
import { StatusAnnouncement } from '../flow_interfaces';

type ReconnectionManagerArgs = {
  timeEndpoint: TimeEndpoint
}

export default class {

  _reconnectionCallback: Function;
  _timeEndpoint: TimeEndpoint;
  _timeTimer: number;

  constructor({ timeEndpoint }: ReconnectionManagerArgs) {
    this._timeEndpoint = timeEndpoint;
  }

  onReconnection(reconnectionCallback: Function) {
    this._reconnectionCallback = reconnectionCallback;
  }

  startPolling() {
    this._timeTimer = setInterval(this._performTimeLoop.bind(this), 3000);
  }

  stopPolling() {
    clearInterval(this._timeTimer);
  }

  _performTimeLoop() {
    this._timeEndpoint((status: StatusAnnouncement) => {
      if (!status.error) {
        clearInterval(this._timeTimer);
        this._reconnectionCallback();
      }
    });
  }

}
