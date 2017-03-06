import { DemoService } from './DemoService';
export { DemoService };

export let services = {
    DemoService: DemoService,
}

export let servicesList = Object.keys(services).map((key) => {
    return services[key];
})