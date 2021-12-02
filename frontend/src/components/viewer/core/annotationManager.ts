import { select } from 'd3-selection';
import { Annotation } from '../../../model/svg/annotation';
import { ANNOTATION_TYPE } from '../../../model/viewer/annotationType';
import { ANNOTATION_COLOR } from '../../../model/viewer/colors';
import { POLYGON_STROKE_WIDTH, POLYGON_VERTICE_RADIUS } from '../../../model/viewer/config';
import { AnnotationData } from '../../../model/viewer/export/annotationData';
import { isSolution, isUserSolution } from '../../../model/viewer/tools';
import { generateAnnotation } from '../factories/generateAnntation';

export class AnnotationManager {
  private _backgroundNode: HTMLElement;
  private _solutionNode: HTMLElement;
  private _userSolutionNode: HTMLElement;

  private _backgroundAnnotations: Annotation[];
  private _solutionAnnotations: Annotation[];
  private _userSolutionAnnotations: Annotation[];

  constructor(backgroundNode: HTMLElement, solutionNode: HTMLElement, userSolutionNode: HTMLElement) {
    this._backgroundNode = backgroundNode;
    this._solutionNode = solutionNode;
    this._userSolutionNode = userSolutionNode;

    this._backgroundAnnotations = [];
    this._solutionAnnotations = [];
    this._userSolutionAnnotations = [];
  }

  /**
   * Adds the given annotation to the array
   *
   * @param annotation Annotation to add
   */
  pushAnnotation(annotation: Annotation): void {
    if (isUserSolution(annotation.type)) {
      this._userSolutionAnnotations.push(annotation);
    } else if (isSolution(annotation.type)) {
      this._solutionAnnotations.push(annotation);
    } else {
      this._backgroundAnnotations.push(annotation);
    }
  }

  /**
   * Adds a solution annotations
   *
   * @param annotation Solution annotation
   */
  pushSolutionAnnotation(annotation: Annotation): void {
    this._solutionAnnotations.push(annotation);
  }

  /**
   * Adds serialized annotation
   *
   * @param data Serialized solution annotation
   * @param scale Current scale of the viewer
   */
  addSolutionAnnotation(data: AnnotationData, scale: number): void {
    this._solutionAnnotations.push(
      this._generateAnnotation(
        data,
        scale,
        data.color + ANNOTATION_COLOR.FILL_OPACITY || ANNOTATION_COLOR.SOLUTION_COLOR + ANNOTATION_COLOR.FILL_OPACITY,
        data.color || ANNOTATION_COLOR.SOLUTION_COLOR
      )
    );
  }

  /**
   * Adds user solution annotation
   *
   * @param annotation User solution annotation
   */
  pushUserSolutionAnnotation(annotation: Annotation): void {
    this._userSolutionAnnotations.push(annotation);
  }

  /**
   * Adds a serialized user solution annotation
   *
   * @param data Serialized user solution annotation
   * @param scale Current scale of the viewer
   */
  addUserSolutionAnnotation(data: AnnotationData, scale: number): void {
    this._userSolutionAnnotations.push(
      this._generateAnnotation(
        data,
        scale,
        data.color + ANNOTATION_COLOR.FILL_OPACITY ||
          ANNOTATION_COLOR.USER_SOLUTION_COLOR + ANNOTATION_COLOR.FILL_OPACITY,
        data.color || ANNOTATION_COLOR.USER_SOLUTION_COLOR
      )
    );
  }

  /**
   * Adds an background annotation
   *
   * @param annotation Background annotation
   */
  pushBackgroundAnnotation(annotation: Annotation): void {
    this._backgroundAnnotations.push(annotation);
  }

  /**
   * Adds a serialized background annotation
   *
   * @param data Serialized background annotation
   * @param scale Current viewer scale
   */
  addBackgroundAnnotation(data: AnnotationData, scale: number): void {
    this._backgroundAnnotations.push(
      this._generateAnnotation(data, scale, 'none', data.color || ANNOTATION_COLOR.BACKGORUND_COLOR)
    );
  }

  /**
   * Adds the serialized annotations
   *
   * @param data Serialized annotations
   * @param scale Current viewer scale
   */
  addAnnotation(data: AnnotationData[], scale: number): void {
    for (const annotation of data) {
      if (annotation.type === ANNOTATION_TYPE.BASE) {
        this.addBackgroundAnnotation(annotation, scale);
      } else if (isSolution(annotation.type)) {
        this.addSolutionAnnotation(annotation, scale);
      } else {
        this.addUserSolutionAnnotation(annotation, scale);
      }
    }
  }

  /**
   * Adds the serialized background annotations
   *
   * @param annotationData Serialized background annotations
   * @param scale Current viewer scale
   */
  addBackgroundAnnotations(annotationData: AnnotationData[], scale: number): void {
    annotationData.forEach((data: AnnotationData) => {
      this.addBackgroundAnnotation(data, scale);
    });
  }

  private _generateAnnotation(data: AnnotationData, scale: number, fillColor: string, strokeColor: string): Annotation {
    return generateAnnotation(data, this.getNode(data.type), scale, fillColor, strokeColor);
  }

  /**
   * Updates an annotation
   *
   * @param opacity Opacity
   * @param scale Current scale of the viewer
   */
  updateAnnotation(opacity: number, scale: number): void {
    const radius = POLYGON_VERTICE_RADIUS / scale;
    const strokeWidth = POLYGON_STROKE_WIDTH / scale;

    for (const annotation of this._backgroundAnnotations) {
      annotation.update(radius, strokeWidth);
    }

    for (const annotation of this._userSolutionAnnotations) {
      annotation.update(radius, strokeWidth);
    }

    for (const annotation of this._solutionAnnotations) {
      annotation.update(radius, strokeWidth);
    }
  }

  /**
   * Clears the annotations
   */
  clear(): void {
    this._userSolutionAnnotations = [];
    this._solutionAnnotations = [];
    this._backgroundAnnotations = [];
  }

  /**
   * Clears the solution annotations
   */
  clearSolutionAnnotations(): void {
    this._solutionAnnotations = [];
    select(this._solutionNode).selectAll('g > *').remove();
  }

  /**
   * Returns the annotations with the given type
   *
   * @param type Annotation type
   * @returns The annotations to the given type
   */
  getAnnotations(type: ANNOTATION_TYPE): Annotation[] {
    if (type === ANNOTATION_TYPE.BASE) {
      return this._backgroundAnnotations;
    } else if (isSolution(type)) {
      return this._solutionAnnotations;
    } else {
      return this._userSolutionAnnotations;
    }
  }

  /**
   * Returns the SVG node to the given type
   *
   * @param type Annotation type
   * @returns SVG node to the given type
   */
  getNode(type: ANNOTATION_TYPE): HTMLElement {
    if (type === ANNOTATION_TYPE.BASE) {
      return this._backgroundNode;
    } else if (isSolution(type)) {
      return this._solutionNode;
    } else {
      return this._userSolutionNode;
    }
  }

  /**
   * Returns the Annotation to the ID
   *
   * @param annotationID ID of the annotation
   * @returns The annotation to the ID
   */
  getAnnotationById(annotationID: string) {
    for (const annotation of this._userSolutionAnnotations) {
      if (annotation.id === annotationID) {
        return annotation;
      }
    }

    for (const annotation of this._backgroundAnnotations) {
      if (annotation.id === annotationID) {
        return annotation;
      }
    }

    for (const annotation of this._solutionAnnotations) {
      if (annotation.id === annotationID) {
        return annotation;
      }
    }
  }

  /**
   * Returns the annotation to the ID and unseelects all other
   *
   * @param annotationId ID of the annotation
   * @returns The annotation to the id
   */
  findByIdAndUnselect(annotationId: string): Annotation {
    let resultAnnotation: Annotation;
    for (const annotation of this._backgroundAnnotations) {
      if (annotation.id !== annotationId) {
        annotation.unselect();
      } else {
        resultAnnotation = annotation;
      }
    }

    for (const annotation of this._solutionAnnotations) {
      if (annotation.id !== annotationId) {
        annotation.unselect();
      } else {
        resultAnnotation = annotation;
      }
    }

    for (const annotation of this._userSolutionAnnotations) {
      if (annotation.id !== annotationId) {
        annotation.unselect();
      } else {
        resultAnnotation = annotation;
      }
    }

    return resultAnnotation!;
  }

  get backgroundAnnotations() {
    return this._backgroundAnnotations;
  }

  get solutionAnnotations() {
    return this._solutionAnnotations;
  }

  get userSolutionAnnotations() {
    return this._userSolutionAnnotations;
  }

  get backgroundNode() {
    return this._backgroundNode;
  }

  get solutionNode() {
    return this._solutionNode;
  }

  get userSolutionNode() {
    return this._userSolutionNode;
  }
}
