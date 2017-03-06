import { Routes } from '@angular/router';
import { UIRouterModule } from 'ui-router-ng2';
import { components } from './components';

export let statesConfig: any = {
  useHash: true,
  otherwise: '/demo',
  states: [
    {
      name: 'demo',
      url: '/demo',
      component: components.DemoComponent
    }
  ]
}