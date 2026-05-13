"use client";

import { useEffect } from "react";
import { datadogRum } from "@datadog/browser-rum";

export function DatadogInit() {
  useEffect(() => {
    const applicationId = process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID;
    const clientToken = process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN;
    const site = process.env.NEXT_PUBLIC_DATADOG_SITE;
    const service = process.env.NEXT_PUBLIC_DATADOG_SERVICE ?? "parkradar";
    const env = process.env.NEXT_PUBLIC_DATADOG_ENV ?? "local";

    if (!applicationId || !clientToken || !site) {
      console.warn("Datadog RUM is not configured.");
      return;
    }

    datadogRum.init({
      applicationId,
      clientToken,
      site,
      service,
      env,
      version: "1.0.0",
      sessionSampleRate: 100,
      sessionReplaySampleRate: 20,
      trackUserInteractions: true,
      trackResources: true,
      trackLongTasks: true,
      defaultPrivacyLevel: "mask-user-input",
    });

    datadogRum.startSessionReplayRecording();
  }, []);

  return null;
}