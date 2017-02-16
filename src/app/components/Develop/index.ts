import {Component, OnInit} from '@angular/core';
import {StagesManager} from '../../services';
import {UIRouter} from 'ui-router-ng2';

@Component({
    styles: [require('./styles.styl').toString()],
    template: require('./template.pug')(),
})
export class DevelopComponent implements OnInit {

    // Attributes
        stagesManager: StagesManager;
        router: UIRouter;
        shown: boolean;

    // Methods
        constructor (stagesManager: StagesManager, router: UIRouter) {
            this.shown = false;
            this.router = router;
            this.stagesManager = stagesManager;
        }

        ngOnInit () {
            var currentStage: any = this.router.stateService.current.name;
            this.stagesManager.setCurrentStage(currentStage);
            setTimeout(() => {
                this.shown = true;
            }, 10);
        }

}