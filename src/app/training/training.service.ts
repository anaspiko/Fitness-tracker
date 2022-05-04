import { Injectable } from "@angular/core";
import { AngularFirestore, DocumentChangeAction } from "angularfire2/firestore";
import { Subject } from "rxjs";
import { Exercise } from "./exercise.model";
import { map } from "rxjs/operators";

@Injectable()
export class TrainingService {
  exerciseChanged = new Subject<Exercise>();
  exercisesChanged = new Subject<Exercise[]>();
  finishedExercisesChanged = new Subject<Exercise[]>();
  private availableExercises: Exercise[] = [];
  private runningExcercise: Exercise;

  constructor(private db: AngularFirestore) {}

  fetchAvailableExercises() {
    this.db
      .collection('availableExercises')
      .snapshotChanges()
      .pipe(
        map(docArray => {
          return docArray.map((doc: DocumentChangeAction<Exercise>) => {
            return {
               id: doc.payload.doc.id,
              // name: doc.payload.doc.data()['name'],
              // duration: doc.payload.doc.data()['duration'],
              // calories: doc.payload.doc.data()['calories']
              ...doc.payload.doc.data()
            } as Exercise;
          });
        }))
        .subscribe((exercises: Exercise[]) => {
          this.availableExercises = exercises;
          this.exercisesChanged.next([...this.availableExercises]);
        });
      }

  startExercise(selectedId: string) {
    // this.db.doc('availableExercises/' + selectedId).update({lastSelected: new Date()})
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
    return { ...this.runningExcercise};
  }

  fetchCompletedOrCancelledExercises() {
    this.db
    .collection('finishedExercises')
    .valueChanges()
    .subscribe((exercises: Exercise[]) => {
      this.finishedExercisesChanged.next(exercises);
    });
  }

  private addDataToDatabase(exercise: Exercise) {
    this.db.collection('finishedExercises').add(exercise);
  }

}
