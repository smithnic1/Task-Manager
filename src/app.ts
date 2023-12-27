// Project Type

enum ProjectStatus { Active, Finished}

class Project {
    constructor(
        public id: string,
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectStatus,
        ) {}
}

// Project State Management Class
type Listener<T> = (items: T[]) => void;

class State<T> {
    protected listeners: Listener<T>[] = [];
    addListener(listenerFn: Listener<T>) {
        this.listeners.push(listenerFn);
    }
}

class ProjectState extends State<Project> {
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
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice());
        }
    }
}

//This is a global constant of ProjectState so we can use it anywhere
// using the static instance so we only every have 1 copy of the class
const projectState = ProjectState.getInstance();

//validation
interface Validatable {
    value: string | number;
    required: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

function validate(validatableInput: Validatable) {
    let isValid = true;
    if (validatableInput.required) {
        isValid = isValid && validatableInput.value.toString().trim().length !== 0;
    }
    if (validatableInput.minLength != null && typeof validatableInput.value === 'string') {
        isValid = isValid && validatableInput.value.length >= validatableInput.minLength;
    }
    if (validatableInput.maxLength != null && typeof validatableInput.value === 'string') {
        isValid = isValid && validatableInput.value.length <= validatableInput.maxLength;
    }
    if (validatableInput.min != null && typeof validatableInput.value === 'number') {
        isValid = isValid && validatableInput.value >= validatableInput.min;
    }
    if (validatableInput.max != null && typeof validatableInput.value === 'number') {
        isValid = isValid && validatableInput.value <= validatableInput.max;
    }
    return isValid;
};


//autobind decorator
function autoBind(_: any, __: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    };
    return adjDescriptor;
}

//Component Base Class
abstract class Component<T extends HTMLElement,U extends HTMLElement> {
    templateElement: HTMLTemplateElement;
    hostElement: T;
    element: U;

    constructor(
        templateId: string,
        hostElementId: string,
        insertAtStart: boolean,
        newElementId?: string,
        ) {
        this.templateElement = <HTMLTemplateElement>document.getElementById(templateId)!;
        this.hostElement = <T>document.getElementById(hostElementId)!;

        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = <U>importedNode.firstElementChild;
        if (newElementId) {
            this.element.id = newElementId;
        }

        this.attach(insertAtStart);
    }

    private attach(insertAtBegining: boolean) {
        this.hostElement.insertAdjacentElement(insertAtBegining ? 'afterbegin' : 'beforeend', this.element);
    }

    abstract configure(): void;
    abstract renderContent(): void;
}

// ProjectList Class
class ProjectList extends Component<HTMLDivElement, HTMLElement>{
    assignProjects: Project[] = [];

    constructor(private type: 'active' | 'finished') {
        super('project-list', 'app', false,`${type}-projects`);

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
        this.configure();
        this.renderContent();
    }

    renderProjects() {
        const listEl = document.getElementById(`${this.type}-project-list`)!;
        listEl.innerHTML = '';
        for (const priItem of this.assignProjects) {
            const listItem = document.createElement('li');
            listItem.textContent = priItem.title;
            listEl?.appendChild(listItem);
        }
    }

    configure(){

    };

    renderContent() {
        const listId = `${this.type}-project-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
    }

}

// ProjectInput Class
class ProjectInput extends Component<HTMLDivElement, HTMLElement> {
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;


    constructor() {
        super('project-input', 'app', true, 'user-input');

        this.titleInputElement = <HTMLInputElement>this.element.querySelector('#title');
        this.descriptionInputElement = <HTMLInputElement>this.element.querySelector('#description');
        this.peopleInputElement = <HTMLInputElement>this.element.querySelector('#people');

        this.configure();
    }

    private gatherUserInput(): [string, string, number] | void{
        const enteredTitle = this.titleInputElement.value;
        const enteredDescriptor = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;

        const titleValidatable: Validatable = {
            value: enteredTitle,
            required: true,
        }
        const descriptorValidate: Validatable = {
            value: enteredDescriptor,
            required: true,
            minLength: 5
        }
        const peopleValidate: Validatable = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 5
        }

        if (
            !validate(titleValidatable) ||
            !validate(descriptorValidate) ||
            !validate(peopleValidate) 
            ) {
                alert('Invalid input, please try again!')
                return;
        } else {
            return [enteredTitle,enteredDescriptor,+enteredPeople];
        }
    };

    configure() {
        this.element.addEventListener('submit', this.submitHandler);
    }

    renderContent(): void {
        
    }

    private clearInputs() {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    }

    @autoBind
    private submitHandler(event: Event) {
        event.preventDefault();
        const userInput = this.gatherUserInput();
        if(Array.isArray(userInput)) {
            const [title, description, people] = userInput;
            // console.log(title, description, people);
            projectState.addProjects(title, description, people);
            this.clearInputs();
        }
    }
};

const prjInput = new ProjectInput();
const activePrjList = new ProjectList('active');
const finishedPrjList = new ProjectList('finished');
