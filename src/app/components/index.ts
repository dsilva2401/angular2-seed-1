import { DemoComponent } from './Demo';
import { MainComponent } from './Main';

export let components = {
    DemoComponent: DemoComponent,
    MainComponent: MainComponent,
}

export let componentsList = Object.keys(components).map((key) => {
    return components[key];
})