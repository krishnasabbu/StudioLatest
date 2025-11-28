export interface ContactPointXpathMap {
  [key: string]: any;
}

export interface BaseProperty {
  name: string;
  [key: string]: any;
}

export interface CompleteInfo {
  MessageKey: string;
  alertId: string;
  properties: {
    contactPointXpathMap: ContactPointXpathMap;
    [key: string]: any;
  };
  baseProperties: {
    [key: string]: BaseProperty;
  };
}

export interface LegacyAlert {
  processClasses: string[];
  rendererClasses: string[];
  completeInfo: CompleteInfo;
}

export interface LegacyAlertsResponse {
  [alertId: string]: LegacyAlert;
}

export type ViewMode = 'table' | 'card';
