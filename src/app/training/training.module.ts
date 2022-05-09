import { NgModule } from "@angular/core";
import { MaterialModule } from "../material.module";
import { SharedModule } from "../shared/shared.module";
import { CurrentTrainingComponent } from "./current-training/current-training.component";
import { StopTrainingComponent } from "./current-training/stop-training.component";
import { NewTrainingComponent } from "./new-training/new-training.component";
import { PastTrainingComponent } from "./past-training/past-training.component";
import { TrainingRoutingModule } from "./training-routing.module";
import { TrainingComponent } from "./training.component";
import { Store, StoreModule } from '@ngrx/store'
import { trainingReducer } from "./training.reducer";

@NgModule({
  declarations: [
    TrainingComponent,
    CurrentTrainingComponent,
    NewTrainingComponent,
    PastTrainingComponent,
    StopTrainingComponent
  ],
  imports: [
    SharedModule,
    TrainingRoutingModule,
    MaterialModule,
    StoreModule.forFeature('training', trainingReducer)
  ]
})
export class TrainingModule {

}
