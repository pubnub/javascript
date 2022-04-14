import TimeEndpoint from '../endpoints/time';
import { StatusAnnouncement } from '../flow_interfaces';

export default class {
  _reconnectionCallback;

  _timeEndpoint;

  _timeTimer;

  constructor({ timeEndpoint }) {
    this._timeEndpoint = timeEndpoint;
  }

  onReconnection(reconnectionCallback) {
    this._reconnectionCallback = reconnectionCallback;
  }

  startPolling() {
    this._timeTimer = setInterval(this._performTimeLoop.bind(this), 3000);
  }

  stopPolling() {
    clearInterval(this._timeTimer);
  }

  _performTimeLoop() {
    this._timeEndpoint((status) => {
      if (!status.error) {
        clearInterval(this._timeTimer);
        this._reconnectionCallback();
      }
    });
  }
}
