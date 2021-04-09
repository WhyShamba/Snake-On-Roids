// Safari 3.0+ "[object HTMLElementConstructor]"
export const isSafari = () =>
  /constructor/i.test(window.HTMLElement as any) ||
  (function (p) {
    return p.toString() === '[object SafariRemoteNotification]';
  })(
    (!window as any['safari']) ||
      (typeof (window as any).safari !== 'undefined' &&
        (window as any).safari.pushNotification)
  );
