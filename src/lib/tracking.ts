/**
 * Helper to track events with Meta Pixel (Facebook Pixel)
 */
export const trackEvent = (eventName: string, params: Record<string, any> = {}) => {
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("track", eventName, params);
  }
};
