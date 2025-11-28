import { LegacyAlertsResponse } from '../types/legacyAlert';

const mockAlerts: LegacyAlertsResponse = {
  "900": {
    "processClasses": [
      "AlertProcessor900.java",
      "DataValidator900.java",
      "EmailProcessor900.java"
    ],
    "rendererClasses": [
      "AlertRenderer900.java",
      "EmailTemplateRenderer900.java"
    ],
    "completeInfo": {
      "MessageKey": "messagekey_900",
      "alertId": "900",
      "properties": {
        "contactPointXpathMap": {
          "email": "/contact/email",
          "phone": "/contact/phone"
        },
        "priority": "high",
        "category": "security"
      },
      "baseProperties": {
        "contactPontService": {
          "name": "contactPointService",
          "version": "2.1.0",
          "endpoint": "/api/v2/contacts"
        },
        "contactPontService1": {
          "name": "contactPontService1",
          "version": "1.5.3",
          "endpoint": "/api/v1/contacts"
        }
      }
    }
  },
  "9001": {
    "processClasses": [
      "AlertProcessor9001.java",
      "DataValidator9001.java"
    ],
    "rendererClasses": [
      "AlertRenderer9001.java",
      "SMSRenderer9001.java",
      "PushNotificationRenderer9001.java"
    ],
    "completeInfo": {
      "MessageKey": "messagekey_9001",
      "alertId": "9001",
      "properties": {
        "contactPointXpathMap": {
          "sms": "/contact/mobile",
          "push": "/contact/deviceId"
        },
        "priority": "medium",
        "category": "notification"
      },
      "baseProperties": {
        "contactPontService": {
          "name": "contactPointService",
          "version": "2.1.0",
          "endpoint": "/api/v2/contacts"
        },
        "contactPontService1": {
          "name": "contactPontService1",
          "version": "1.5.3",
          "endpoint": "/api/v1/contacts"
        },
        "messagingService": {
          "name": "messagingService",
          "version": "3.0.1",
          "endpoint": "/api/v3/messages"
        }
      }
    }
  },
  "9002": {
    "processClasses": [
      "AlertProcessor9002.java"
    ],
    "rendererClasses": [
      "AlertRenderer9002.java",
      "EmailRenderer9002.java"
    ],
    "completeInfo": {
      "MessageKey": "messagekey_9002",
      "alertId": "9002",
      "properties": {
        "contactPointXpathMap": {}
      },
      "baseProperties": {
        "contactPontService": {
          "name": "contactPointService",
          "version": "2.1.0"
        }
      }
    }
  },
  "1001": {
    "processClasses": [
      "FraudAlertProcessor.java",
      "TransactionValidator.java",
      "RiskAssessment.java"
    ],
    "rendererClasses": [
      "FraudAlertRenderer.java",
      "TransactionReportRenderer.java"
    ],
    "completeInfo": {
      "MessageKey": "fraud_alert_1001",
      "alertId": "1001",
      "properties": {
        "contactPointXpathMap": {
          "email": "/customer/email",
          "phone": "/customer/phone",
          "address": "/customer/address"
        },
        "priority": "critical",
        "category": "fraud",
        "threshold": 5000
      },
      "baseProperties": {
        "fraudDetectionService": {
          "name": "fraudDetectionService",
          "version": "4.2.1",
          "endpoint": "/api/fraud/detect"
        },
        "notificationService": {
          "name": "notificationService",
          "version": "2.3.0",
          "endpoint": "/api/notifications"
        }
      }
    }
  },
  "2500": {
    "processClasses": [
      "AccountAlertProcessor.java",
      "BalanceChecker.java"
    ],
    "rendererClasses": [
      "AccountAlertRenderer.java"
    ],
    "completeInfo": {
      "MessageKey": "account_alert_2500",
      "alertId": "2500",
      "properties": {
        "contactPointXpathMap": {
          "email": "/account/owner/email"
        },
        "priority": "low",
        "category": "account"
      },
      "baseProperties": {
        "accountService": {
          "name": "accountService",
          "version": "1.8.0",
          "endpoint": "/api/accounts"
        }
      }
    }
  }
};

const mockFileContent: Record<string, string> = {
  "AlertProcessor900.java": `# AlertProcessor900.java

## Package
\`\`\`java
package com.wellsfargo.alerts.processor;
\`\`\`

## Class Description
Main processor class for Alert 900. Handles incoming alert requests and coordinates processing.

## Key Methods
- **processAlert()**: Processes incoming alert data
- **validate()**: Validates alert payload
- **enrichData()**: Enriches alert with additional context

## Dependencies
- DataValidator900
- EmailProcessor900
- AlertRenderer900`,

  "DataValidator900.java": `# DataValidator900.java

## Package
\`\`\`java
package com.wellsfargo.alerts.validator;
\`\`\`

## Class Description
Validation logic for Alert 900 data integrity.

## Validation Rules
- Email format validation
- Phone number format validation
- Required fields check
- Data type verification`,

  "EmailProcessor900.java": `# EmailProcessor900.java

## Package
\`\`\`java
package com.wellsfargo.alerts.email;
\`\`\`

## Class Description
Email processing and sending functionality for Alert 900.

## Features
- Template rendering
- Attachment handling
- SMTP configuration
- Retry logic`,

  "AlertRenderer900.java": `# AlertRenderer900.java

## Package
\`\`\`java
package com.wellsfargo.alerts.renderer;
\`\`\`

## Class Description
Renderer class for Alert 900 output formatting.

## Supported Formats
- HTML
- Plain text
- JSON
- XML`,

  "EmailTemplateRenderer900.java": `# EmailTemplateRenderer900.java

## Package
\`\`\`java
package com.wellsfargo.alerts.renderer.email;
\`\`\`

## Class Description
Email template rendering for Alert 900.

## Templates
- Welcome template
- Alert notification template
- Confirmation template`
};

export const legacyAlertService = {
  async getAllAlerts(): Promise<LegacyAlertsResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockAlerts);
      }, 300);
    });
  },

  async getAlertById(alertId: string): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockAlerts[alertId] || null);
      }, 200);
    });
  },

  async getFileContent(alertId: string, fileName: string): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const content = mockFileContent[fileName] || `# ${fileName}

## File not found in mock data

This is a placeholder for **${fileName}** from Alert ${alertId}.

In a production environment, this would load the actual Java file content from the backend API.

## Sample Structure
\`\`\`java
package com.wellsfargo.alerts;

public class ${fileName.replace('.java', '')} {
    // Class implementation
}
\`\`\``;
        resolve(content);
      }, 200);
    });
  }
};
