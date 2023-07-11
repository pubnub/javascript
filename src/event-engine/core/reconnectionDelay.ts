export class ReconnectionDelay {
  static getDelay(policy: string, attempts: number, backoff?: number): number {
    let backoffValue = backoff ?? 5;
    switch (policy.toUpperCase()) {
      case 'LINEAR':
        return attempts * backoffValue + Math.random() * 1000;
      case 'EXPONENTIAL':
        return Math.trunc(Math.pow(2, attempts - 1)) * 1000 + Math.random() * 1000;
      default:
        throw new Error('invalid policy');
    }
  }
}
