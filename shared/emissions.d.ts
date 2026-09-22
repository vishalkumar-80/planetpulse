export declare const activityTypes: readonly ["Car", "Bus", "Flight", "Electricity", "Vegetarian Meal", "Non-Vegetarian Meal"];
export type ActivityType = (typeof activityTypes)[number];
/** Fixed values mandated by the hackathon brief. */
export declare const emissionFactors: Record<ActivityType, {
    factor: number;
    unit: string;
}>;
export declare function calculateCO2(type: ActivityType, quantity: number): {
    emissionFactor: number;
    unit: string;
    co2Kg: number;
};
