import { StagesManager } from './StagesManager';
export { StagesManager };

export let services = {
    StagesManager: StagesManager,
}

export let servicesList = Object.keys(services).map((key) => {
    return services[key];
})