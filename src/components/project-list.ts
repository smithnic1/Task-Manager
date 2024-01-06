namespace App {
    // ProjectList Class
    export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget{
        assignProjects: Project[] = [];

        constructor(private type: 'active' | 'finished') {
            super('project-list', 'app', false,`${type}-projects`);
            this.configure();
            this.renderContent();
        }

        @autoBind
        dragOverHandler(event: DragEvent): void {
            if(event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
                event.preventDefault();
                const listEl = this.element.querySelector('ul')!;
                listEl.classList.add('droppable');
            }
        }

        @autoBind
        dropHandler(event: DragEvent): void {
            const prjId = event.dataTransfer!.getData('text/plain');  
            projectState.moveProject(
                prjId,
                this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished
            );
        }
        
        @autoBind
        dragLeaveHandler(_: DragEvent): void {
            const listEl = this.element.querySelector('ul')!;
            listEl.classList.remove('droppable');
        }

        renderProjects() {
            const listEl = document.getElementById(`${this.type}-project-list`)!;
            listEl.innerHTML = '';
            for (const priItem of this.assignProjects) {
                new ProjectItem(this.element.querySelector('ul')!.id, priItem);
            }
        }

        configure(){
            this.element.addEventListener('dragover', this.dragOverHandler);
            this.element.addEventListener('dragleave', this.dragLeaveHandler);
            this.element.addEventListener('drop', this.dropHandler);
            projectState.addListener((projects: Project[]) => {
                const relevantProjects = projects.filter(prj => {
                    if(this.type === 'active') {
                        return prj.status === ProjectStatus.Active;
                    }
                    return prj.status === ProjectStatus.Finished;
                })
                this.assignProjects = relevantProjects;
                this.renderProjects();
            });
        };

        renderContent() {
            const listId = `${this.type}-project-list`;
            this.element.querySelector('ul')!.id = listId;
            this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
        }

    }
}