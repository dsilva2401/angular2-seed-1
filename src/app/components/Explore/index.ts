import {Component, OnInit} from '@angular/core';
import {StagesManager} from '../../services';
import {UIRouter} from 'ui-router-ng2';

@Component({
    styles: [require('./styles.styl').toString()],
    template: require('./template.pug')(),
})
export class ExploreComponent implements OnInit {

    // Attributes
        stagesManager: StagesManager;
        router: UIRouter;
        entries: any [];
        shown: boolean;

    // Methods
        constructor (stagesManager: StagesManager, router: UIRouter) {
            this.shown = false;
            this.router = router;
            this.stagesManager = stagesManager;
            this.entries = [];
        }

        loadEntries () {
            this.entries.push({
                rid: 'willow-'+Math.floor(Math.random()*100)+'-xyz',
                thumbnail: 'http://cdn.home-designing.com/wp-content/uploads/2013/08/modern-apartment-1.jpg'
            })
            for (let i=0; i<6; i++) {
                this.entries.push({
                    rid: 'willow-'+Math.floor(Math.random()*100)+'-xyz',
                    thumbnail: ''
                })
            }
        }

        ngOnInit () {
            var currentStage: any = this.router.stateService.current.name;
            this.stagesManager.setCurrentStage(currentStage);
            this.loadEntries();
            setTimeout(() => {
                this.shown = true;
            }, 10);
        }

}