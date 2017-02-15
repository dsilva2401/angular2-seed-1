import { DemoComponent } from './Demo';
import { HomeComponent } from './Home';

export let components = {
    DemoComponent: DemoComponent,
    HomeComponent: HomeComponent
}

export let componentsList = Object.keys(components).map((key) => {
    return components[key];
})