import {Component, OnInit} from '@angular/core';
import {UIRouter} from 'ui-router-ng2';
import {StagesManager, AvailableStages} from '../../services/StagesManager';

@Component({
    selector: 'studio',
    styles: [require('./styles.styl').toString()],
    template: require('./template.pug')(),
})
export class StudioComponent implements OnInit {

    // Attributes
        currentStage: AvailableStages;
        stagesManager: StagesManager;

    // Methods
        constructor (stagesManager: StagesManager) {
            this.stagesManager = stagesManager;
            this.stagesManager.onStageChange((newStage) => {
                this.currentStage = newStage;
            });
        }

        goToStage (stageName) {
            this.stagesManager.goToStage(stageName);
        }

        ngOnInit () {}

}