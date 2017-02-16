import { Routes } from '@angular/router';
import { UIRouterModule } from 'ui-router-ng2';
import { components } from './components';

export let statesConfig: any = {
  useHash: true,
  otherwise: '/explore',
  states: [
    {
      name: 'explore',
      url: '/explore',
      component: components.ExploreComponent
    }, {
      name: 'develop',
      url: '/develop',
      component: components.DevelopComponent
    }, {
      name: 'preview',
      url: '/preview',
      component: components.PreviewComponent
    }, {
      name: 'publish',
      url: '/publish',
      component: components.PublishComponent
    }
  ]
}