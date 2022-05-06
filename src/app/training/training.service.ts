import { Injectable } from "@angular/core";
import { AngularFirestore } from "angularfire2/firestore";
import { Subject, Subscription } from "rxjs";
import { Exercise } from "./exercise.model";
import { map } from "rxjs";
import { UIService } from "../shared/ui.service";

@Injectable({
  providedIn: 'root'
})
export class TrainingService {
  exerciseChanged = new Subject<Exercise>();
  exercisesChanged = new Subject<Exercise[]>();
  finishedExercisesChanged = new Subject<Exercise[]>();
  private availableExercises: Exercise[] = [];
  private runningExcercise: Exercise;
  private fbSubs: Subscription[] = [];

  constructor(private db: AngularFirestore, private uiService: UIService) {}

  fetchAvailableExercises() {
    this.uiService.loadingStateChanged.next(true);
    this.fbSubs.push(this.db
      .collection('availableExercises')
      .snapshotChanges()
      .pipe(
        map(docArray => {
          return docArray.map(doc => {
            return {
               id: doc.payload.doc.id,
              ...doc.payload.doc.data() as Exercise
            };
          });
        }))
        .subscribe((exercises: Exercise[]) => {
          this.uiService.loadingStateChanged.next(false);
          this.availableExercises = exercises;
          this.exercisesChanged.next([...this.availableExercises]);
        }, error => {
          this.uiService.loadingStateChanged.next(false);
          this.uiService.showSnackbar('Fetching Exercises failed, please try again later.', null, 3000);
          this.exercisesChanged.next(null);
        }));
      }

  startExercise(selectedId: string) {
    this.runningExcercise = this.availableExercises.find(
      ex => ex.id === selectedId);
    this.exerciseChanged.next({...this.runningExcercise});
  }

  completeExercise() {
    this.addDataToDatabase({
      ...this.runningExcercise,
      date: new Date(),
      state: 'completed'});
    this.runningExcercise = null;
    this.exerciseChanged.next(null);
  }

  cancelExercise(progress: number) {
    this.addDataToDatabase({
      ...this.runningExcercise,
      duration: this.runningExcercise.duration * (progress / 100),
      calories: this.runningExcercise.calories * (progress / 100),
      date: new Date(),
      state: 'cancelled'
    });
    this.runningExcercise = null;
    this.exerciseChanged.next(null);
  }

  getRunningExercise() {
    return { ...this.runningExcercise };
  }

  fetchCompletedOrCancelledExercises() {
    this.uiService.loadingStateChanged.next(true);
    this.fbSubs.push(this.db
    .collection('finishedExercises')
    .valueChanges()
    .subscribe((exercises: Exercise[]) => {
      this.finishedExercisesChanged.next(exercises);
    }));
  }

  cancelSubscriptions() {
    this.fbSubs.forEach(sub => sub.unsubscribe());
  }

  private addDataToDatabase(exercise: Exercise) {
    this.db.collection('finishedExercises').add(exercise);
  }

}
