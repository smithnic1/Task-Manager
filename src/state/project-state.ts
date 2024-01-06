namespace App {
    // Project State Management Class
    type Listener<T> = (items: T[]) => void;

    class State<T> {
        protected listeners: Listener<T>[] = [];
        addListener(listenerFn: Listener<T>) {
            this.listeners.push(listenerFn);
        }
    }

    export class ProjectState extends State<Project> {
        private projects: Project[] = [];
        private static instance: ProjectState;

        private constructor() {
            super();
        }

        static getInstance() {
            if (this.instance) {
                return this.instance
            }
            this.instance = new ProjectState();
            return this.instance;
        }

        addProjects(title: string, description: string, numOfPeople: number) {
            const newProject = new Project(
                Math.random().toString(),
                title,
                description,
                numOfPeople,
                ProjectStatus.Active
            );
            this.projects.push(newProject);
            this.updateListeners();
        }

        moveProject(projectId: string, newStatus: ProjectStatus) {
            const project = this.projects.find(prj => prj.id === projectId);
            if (project && project.status !== newStatus) {
                project.status = newStatus;
                this.updateListeners();
            }

        }

        private updateListeners() {
            for (const listenerFn of this.listeners) {
                listenerFn(this.projects.slice());
            }
        }
    }

    //This is a global constant of ProjectState so we can use it anywhere
    // using the static instance so we only every have 1 copy of the class
    export const projectState = ProjectState.getInstance();
}