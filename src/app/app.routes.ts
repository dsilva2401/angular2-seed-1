import { Routes } from '@angular/router';
import { UIRouterModule } from 'ui-router-ng2';
import { components } from './components';

export let states: any = [
  {
    name: 'hello',
    url: '/hello',
    component: components.HomeComponent
  }, {
    name: 'demo',
    url: '/demo',
    component: components.DemoComponent
  }
]
