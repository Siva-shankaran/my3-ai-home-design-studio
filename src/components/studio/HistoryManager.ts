import { ProjectDesign } from '../../types/project.ts';

export class HistoryManager {
  private undoStack: ProjectDesign[] = [];
  private redoStack: ProjectDesign[] = [];
  private maxDepth: number;

  constructor(maxDepth: number = 50) {
    this.maxDepth = maxDepth;
  }

  /**
   * Pushes a new state to the history
   */
  public push(state: ProjectDesign): void {
    // Deep clone state snapshot
    const clone = JSON.parse(JSON.stringify(state));
    this.undoStack.push(clone);
    if (this.undoStack.length > this.maxDepth) {
      this.undoStack.shift();
    }
    // Any new change clears the redo stack
    this.redoStack = [];
  }

  /**
   * Undoes the last operation and returns the previous state
   */
  public undo(currentState: ProjectDesign): ProjectDesign | null {
    if (this.undoStack.length === 0) return null;
    const previous = this.undoStack.pop()!;
    this.redoStack.push(JSON.parse(JSON.stringify(currentState)));
    return previous;
  }

  /**
   * Redoes the last undone operation and returns the next state
   */
  public redo(currentState: ProjectDesign): ProjectDesign | null {
    if (this.redoStack.length === 0) return null;
    const next = this.redoStack.pop()!;
    this.undoStack.push(JSON.parse(JSON.stringify(currentState)));
    return next;
  }

  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
}
