/**
 * Helper to track events with Meta Pixel (Facebook Pixel)
 */

declare global {
  interface Window {
    fbq: any;
  }
}

export const trackEvent = (eventName: string, params: Record<string, any> = {}) => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", eventName, params);
  }
};

export const trackPageView = () => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "PageView");
  }
};
