import { Injectable, EventEmitter } from '@angular/core';
import { UIRouter } from 'ui-router-ng2';

export type AvailableStages = 'explore' | 'develop' | 'preview' | 'publish';

@Injectable()
export class StagesManager {

    // Attributes
        private eventEmitter: EventEmitter<any>;
        private currentStage: AvailableStages;
        private previousStage: AvailableStages;
        private router: UIRouter;

    // Methods
        constructor (router: UIRouter) {
            this.router = router;
            this.currentStage = null;
            this.previousStage = null;
            this.eventEmitter = new EventEmitter();
        }

        public onStageChange (callback: Function) {
            this.eventEmitter.subscribe(callback);
        }

        public getCurrentStage (): AvailableStages {
            return this.currentStage;
        }

        public getPreviousStage (): AvailableStages {
            return this.previousStage;
        }

        public goToStage (newStage: AvailableStages) {
            // .. validation
            this.router.stateService.go(newStage);
        }

        public setCurrentStage (newStage: AvailableStages) {
            this.previousStage = this.currentStage;
            this.currentStage = newStage;
            this.eventEmitter.emit(newStage);
        }

}