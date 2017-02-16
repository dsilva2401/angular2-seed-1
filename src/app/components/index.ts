import { DevelopComponent } from './Develop';
import { ExploreComponent } from './Explore';
import { PreviewComponent } from './Preview';
import { PublishComponent } from './Publish';
import { StudioComponent } from './Studio';

export let components = {
    DevelopComponent: DevelopComponent,
    ExploreComponent: ExploreComponent,
    PreviewComponent: PreviewComponent,
    PublishComponent: PublishComponent,
    StudioComponent: StudioComponent,
}

export let componentsList = Object.keys(components).map((key) => {
    return components[key];
})