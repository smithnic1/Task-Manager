/// <reference path="base-components.ts" />

namespace App {
    // ProjectInput Class
    export class ProjectInput extends Component<HTMLDivElement, HTMLElement> {
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
}