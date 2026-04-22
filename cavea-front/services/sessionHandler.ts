let handler: (() => void) | null = null;

export const registerSessionHandler = (fn: () => void) => {
  handler = fn;
};

export const onSessionExpired = () => {
  handler?.();
};
