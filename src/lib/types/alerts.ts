export type AlertType = 'success' | 'error' | 'info' | 'warning';
export type AlertTypeDetails = {
    classes: string;
    icon: string;
}

export interface Alert {
    id: string;

    message: string;
    type: AlertType;
    typeDetails?: AlertTypeDetails;

    created_at: Date;
    lasts_until: Date;
    active: boolean;
}