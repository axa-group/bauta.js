import { CancelableToken, OnCancel } from '../types.js';

export class CancelableTokenBuilder implements CancelableToken {
  private cancelStack: OnCancel[] = [];

  public isCanceled = false;

  cancel() {
    this.isCanceled = true;
    this.cancelStack.forEach(onCancel => onCancel());
  }

  onCancel(fn: OnCancel) {
    this.cancelStack.push(fn);
  }
}

export default CancelableToken;
