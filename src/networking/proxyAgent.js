import { ProxyAgent } from 'proxy-agent';

export default function (superagent) {
  var Request = superagent.Request;
  Request.prototype.proxy = proxy;
  return superagent;
}

function proxy(proxyConfiguration) {
  var agent = new ProxyAgent(proxyConfiguration);

  if (agent) this.agent(agent);

  return this;
}
