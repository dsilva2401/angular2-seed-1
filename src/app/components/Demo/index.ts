import {Component} from '@angular/core';

@Component({
  selector: 'home',
  styles: [require('./styles.styl').toString()],
  template: require('./template.pug')()
})
export class DemoComponent {

}
