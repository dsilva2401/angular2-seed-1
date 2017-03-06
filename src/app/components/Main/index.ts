import {Component, OnInit} from '@angular/core';
import {UIRouter} from 'ui-router-ng2';

@Component({
    selector: 'main',
    styles: [require('./styles.styl').toString()],
    template: require('./template.pug')(),
})
export class MainComponent implements OnInit {

    // Attributes

    // Methods
        constructor () {}

        ngOnInit () {}

}