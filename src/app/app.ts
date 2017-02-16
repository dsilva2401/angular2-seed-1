import {Component} from '@angular/core';
import {components} from './components';

@Component({
  selector: 'app',
  template: require('./app.pug')()
})
export class AppComponent {
}
