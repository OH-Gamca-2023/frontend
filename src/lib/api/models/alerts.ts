import type { Alert, AlertType, AlertTypeDetails } from "$lib/types";
import { LoadableModel } from "$lib/utils/models";

const alertTypeDetails: Record<AlertType, AlertTypeDetails> = {
    'warning': {
        classes: "dark:bg-yellow-600 dark:border-yellow-800 bg-yellow-200 border-yellow-500",
        icon: "mdi:alert-outline"
    },
    'error': {
        classes: "dark:bg-red-700 dark:border-red-900 bg-red-200 border-red-500",
        icon: "mdi:alert-circle-outline"
    },
    'success': {
        classes: "dark:bg-green-600 dark:border-green-800 bg-green-200 border-green-500",
        icon: "mdi:check-circle-outline"
    },
    'info': {
        classes: "dark:bg-blue-600 dark:border-blue-900 bg-blue-200 border-blue-500",
        icon: "mdi:information-outline"
    }
}


export const alerts = new LoadableModel<Alert>(
    "data/alerts",
    (raw) => {
        const rawData = raw as any;

        const base = {
            id: rawData.id,

            message: rawData.message,
            type: rawData.type,
            typeDetails: alertTypeDetails[rawData.type as AlertType],

            created_at: new Date(rawData.created_at),
            lasts_until: new Date(rawData.lasts_until),
            active: rawData.active,
        } as Alert;

        return base;
    },
    false,
    [],
    "list",
    false,
    false,
);