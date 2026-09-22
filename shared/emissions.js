export const activityTypes = ['Car', 'Bus', 'Flight', 'Electricity', 'Vegetarian Meal', 'Non-Vegetarian Meal'];
/** Fixed values mandated by the hackathon brief. */
export const emissionFactors = {
    Car: { factor: 0.2, unit: 'km' },
    Bus: { factor: 0.08, unit: 'km' },
    Flight: { factor: 0.25, unit: 'km' },
    Electricity: { factor: 0.8, unit: 'kWh' },
    'Vegetarian Meal': { factor: 0.5, unit: 'meals' },
    'Non-Vegetarian Meal': { factor: 2, unit: 'meals' },
};
export function calculateCO2(type, quantity) {
    const { factor, unit } = emissionFactors[type];
    return { emissionFactor: factor, unit, co2Kg: Number((quantity * factor).toFixed(2)) };
}
