var activeList = {
    "name": "i'm-changing-the-name",
    "tasks": [
        {
            "name": "Lorem ipsum",
            "severity": 1,
            "completionStatus": false
        },
        {
            "name": "Lorem ipsum",
            "severity": 2,
            "completionStatus": false
        },
        {
            "name": "Lorem ipsum",
            "severity": 3,
            "completionStatus": false
        },
        {
            "name": "Lorem ipsum",
            "severity": 4,
            "completionStatus": false
        },
        {
            "name": "Lorem ipsum",
            "severity": 5,
            "completionStatus": false
        },
        {
            "name": "Lorem ipsum",
            "severity": 3,
            "completionStatus": false
        }
    ]
}

var activeFileName = ""

var currentTask = {
	"name": null,
	"severity": null,
	"completionStatus": null,
	"id": null
}

window.onload = ( function(){
	getLists();
	setTimeout(() => {
		if(localStorage.getItem("activeListID") != "" | null) {
			loadList(localStorage.getItem("activeListID"))
		}
		setTimeout(() => {
			if(localStorage.getItem("activeTaskID") != "" | null) {
				loadTask(localStorage.getItem("activeTaskID"))
			}
		}, 25)
	}, 25)
	
 })

function useLocalStorage() {
	if(localStorage.getItem("activeListID") != "" | null) {
		console.log("loading stored list")
		loadList(localStorage.getItem("activeListID"))
	}
}

// function help() {
//     fetch("http://127.0.0.1:8080/help")
//         .then(res => {
//             if(!res.ok){
//                 throw new Error();
//             }
//             return res.json();
//         })
//         .then(data => {
//             console.log(data);
//         })
// }

function getLists() {
    fetch("http://127.0.0.1:8080/?cmd=lsls")
    	.then(res => {
        	if(!res.ok){
       		 	throw new Error();
        	}
        	return res.json();
        })
		.then(data => {
            // console.log(data.data1)
			let listContainer = document.querySelector(".list_menu_lists")
            for (let i = 0; i<data.data1.length; i++) {
                listContainer.appendChild(elementFromHTML(`
                    <button type="button" id="list-${data.data1[i]}" class="list_menu_list" onclick="loadList(this.id)">
                        <h3 class="list_menu_item_title">
                            ${data.data1[i]}
                        </h3>
                    </button>
                `))
            }

			localStorage.setItem("lists", data.data1)
		})
}

function loadList(id) {
    let buttons = document.querySelectorAll(`.list_menu_list`)
    buttons.forEach(button => {
        button.classList.remove("list_menu_list_active")
    });

    let button = document.querySelector(`.list_menu_list[id="${id}"]`)
    button.classList.add("list_menu_list_active")

    let listName = id.substring(5)
	activeFileName = listName
	localStorage.setItem("activeListID", id)
	// localStorage.setItem("activeTaskID", null)
	// currentTask = {
	// 	"name": null,
	// 	"severity": null,
	// 	"completionStatus": null,
	// 	"id": null
	// }

    fetch(`http://127.0.0.1:8080/?cmd=opls&cmd=${listName}`)
    	.then(res => {
        	if(!res.ok){
       		 	throw new Error();
        	}
        	return res.json();
        })
		.then(data => {
            // console.log(data.data1)
			activeList = data.data1
			localStorage.setItem("activeList", activeList)
            let listName = document.querySelector(".list_name")
            listName.textContent = data.data1.name

            let taskContainer = document.querySelector(".list_data")
			taskContainer.innerHTML = ""
            for (let i = 0; i<data.data1.tasks.length; i++) {
				let name = data.data1.tasks[i].name
				let taskNum = i+1
				let importance = ""
				// console.log("Task " + (i+1) + ": " + data.data1.tasks[i].severity)
				switch (data.data1.tasks[i].severity) {
					case 1:
						importance = "Very low"
						break
					case 2:
						importance = "Low"
						break
					case 3:
						importance = "Medium"
						break
					case 4:
						importance = "High"
						break
					case 5:
						importance = "Very high"
						break
				}
				let completionStatus = ""
				if(!data.data1.tasks[i].completionStatus) {
					completionStatus = "No"
				} else {
					completionStatus = "Yes"
				}
                taskContainer.appendChild(elementFromHTML(`
					<button type="button" id="task-${name}" class="list_data_item" onclick="loadTask('task-${name}')">
						<h3 class="list_data_item_title">
							${name}
						</h3>
						<ul class="list_data_item_attributes">
							<li class="list_data_item_attribute">
								<p>Task #:</p>
								<p class="list_data_item_task_num">${taskNum}</p>
							</li>
							<li class="list_data_item_attribute">
								<p>Importance:</p>
								<p class="list_data_item_severity">${importance}</p>
							</li>
							<li class="list_data_item_attribute">
								<p>Completed?:</p>
								<p class="list_data_item_completeion">${completionStatus}</p>
							</li>
						</ul>
                	</button>
                `))
            }
		})
}

function createList() {
    // popup()
}

function deleteList() {
	console.log("deleting list")
}

function loadTask(id) {
	console.log(id)
	if(id == null || id == "null") {
		console.log("task does not exist")
		return
	}
    let buttons = document.querySelectorAll(`.list_data_item`)
    buttons.forEach(button => {
        button.classList.remove("list_data_item_active")
    });

    let button = document.querySelector(`[id="${id}"]`)
	console.log(id)
    button.classList.add("list_data_item_active")

	localStorage.setItem("activeTaskID", button.id)

	currentTask.index = button.querySelector(".list_data_item_task_num").textContent - 1
	console.log("current task " + currentTask.index)
	currentTask.name =  activeList.tasks[currentTask.index].name
	currentTask.severity = activeList.tasks[currentTask.index].severity
	currentTask.completionStatus = activeList.tasks[currentTask.index].completionStatus

	let completionStatus = "close"
	if(currentTask.completionStatus){
		completionStatus = "check"
	}

	localStorage.setItem("currentTask", currentTask)

	let editAttributes = document.querySelector(".edit_panel_replaceable")
	console.log(editAttributes)
	editAttributes.parentNode.replaceChild(elementFromHTML(`
		<div class="edit_panel_replaceable">
			<div class="edit_panel_attributes">
				<div class="edit_panel_item">
					<h3 class="edit_panel_item_title">Task Name:</h3>
					<input name="task_name_input" type="text" class="edit_panel_item_value" placeholder="Task Name" value="${currentTask.name}" onchange="nameChanged()" autocomplete="none">
				</div>
				<div class="edit_panel_item">
					<h3 class="edit_panel_item_title">Task Importance:</h3>
					<select name="task_importance_selector" class="edit_panel_item_value" onchange="importanceChanged()">
						<option value="1">Very low</option>
						<option value="2">Low</option>
						<option value="3">Medium</option>
						<option value="4">High</option>
						<option value="5">Very high</option>
					</select>
				</div>
				<div class="edit_panel_item">
					<h3 class="edit_panel_item_title">Task Completed?:</h3>
					<button name="task_completionStatus_checkbox" type="button" class="edit_panel_item_value" onclick="completionChanged()">
						<span class="material-symbols-rounded">
							${completionStatus}
						</span>
					</button>
				</div>
				<div class="edit_panel_item">
					<h3 class="edit_panel_item_title">Notes:</h3>
					<textarea spellcheck="false" autocomplete="off" class="edit_panel_item_value" label="notes_edit_input" placeholder="Notes" onchange="notesChanged()" ></textarea>
				</div>
			</div>
			<div class="edit_panel_close">
				<button type="button" class="edit_panel_close_button special" onclick="savecloseTaskEdit(event)">
					<span class="material-symbols-rounded">
						save
					</span>
					<h3>
						Save
					</h3>
				</button>
				<button type="button" class="edit_panel_close_button special" onclick="closeTaskEdit()">
					<span class="material-symbols-rounded">
						cancel
					</span>
					<h3>
						Cancel
					</h3>
				</button>
			</div>
			<div class="edit_panel_close">
				<button type="button" class="edit_panel_close_button_single error" onclick="deleteList()">
					<span class="material-symbols-rounded">
						delete
					</span>
					<h3>
						Delete Task
					</h3>
				</button>
			</div>
		</div>
	`), editAttributes)
	document.querySelector(`.edit_panel_item_value > option[value="${currentTask.severity}"]`).setAttribute('selected', 'true')
}

function nameChanged() {
	let name = document.querySelector(`input.edit_panel_item_value`)
	currentTask.name = name.value
	if(currentTask.name != activeList.tasks[currentTask.index].name){
		name.classList.add("edit_panel_item_value_changed")
	} else {
		name.classList.remove("edit_panel_item_value_changed")
	}
}

function importanceChanged() {
	console.log(activeList.tasks[currentTask.index]) 
	let selector = document.querySelector(`select.edit_panel_item_value`)
	currentTask.severity = selector.value
	if(currentTask.severity != activeList.tasks[currentTask.index].severity){
		selector.classList.add("edit_panel_item_value_changed")
	} else {
		selector.classList.remove("edit_panel_item_value_changed")
	}
}

function completionChanged() {
	currentTask.completionStatus = !currentTask.completionStatus
	let checkbox = document.querySelector(`.edit_panel_item_value[type="button"]`)
	let check = document.querySelector(".edit_panel_item_value span")

	if(currentTask.completionStatus != activeList.tasks[currentTask.index].completionStatus) {
		checkbox.classList.add("edit_panel_item_value_changed")
	} else {
		checkbox.classList.remove("edit_panel_item_value_changed")
	}

	console.log(currentTask.completionStatus)

	if(currentTask.completionStatus) {
		check.innerHTML = "check"
	} else {
		check.innerHTML = "close"
	}
}

function notesChanged(){
	let note = document.querySelector(`input.edit_panel_item_value`)
	// currentTask.note = note.value
	if(currentTask.note != activeList.tasks[currentTask.index].note){
		note.classList.add("edit_panel_item_value_changed")
	} else {
		note.classList.remove("edit_panel_item_value_changed")
	}
}

function savecloseTaskEdit() {
	let name = currentTask.name
	let severity = currentTask.severity
	let completionStatus = currentTask.completionStatus
	let note = currentTask.note
	let index = currentTask.index
	console.log("name: " + name)
	console.log("severity: " + severity)
	console.log("completionStatus: " + completionStatus)
	console.log("index: " + index)

	localStorage.setItem("activeTaskID", `task-${currentTask.name}`)

	fetch(`http://127.0.0.1:8080?cmd=edls&cmd=task&cmd=${name}&cmd=${severity}&cmd=${completionStatus}&cmd=${note}&cmd=${index}&cmd=${activeFileName}`)
		.then(res => {

			console.log(res)
			// if(!res.ok) {
			// 	throw new Error
			// }
			// return res.json()
		})
		.then(data => {
			activeList = data.data1
		})
}

function closeTaskEdit() {
	let changedItems = document.querySelectorAll(".edit_panel_item_value_changed")
	changedItems.forEach((element) => {console.log(element.name)})
	if(true){
		currentTask = {
			name: null,
			severity: null,
			completionStatus: null,
			id: null
		}
		localStorage.setItem("activeTaskID", null)
	}
	let editAttributes = document.querySelector(".edit_panel_replaceable")
	editAttributes.parentNode.replaceChild(elementFromHTML(`
		<div class="edit_panel_replaceable">
			<div class="edit_panel_attributes">
				<div class="edit_panel_item">
					<h3 class="edit_panel_item_title">
						List Name:
					</h3>
					<input type="text" class="edit_panel_item_value" placeholder="List Name" title="list_name_input" value="${activeList.name}">
				</div>
				<div class="edit_panel_item">
					<h3 class="edit_panel_item_title">
						Search Tasks:
					</h3>
					<input type="search" class="edit_panel_item_value" placeholder="Task Name" title="task_search_input">
				</div>
				<div class="edit_panel_item">
					<h3 class="edit_panel_item_title">
						Sort By:
					</h3>
					<select class="edit_panel_item_value" title="task_importance_selector" onchange="importanceChanged()">
						<option value="1">Name</option>
						<option value="2" selected>Task #</option>
						<option value="3">Importance</option>
						<option value="4">Completion</option>
					</select>
				</div>
			</div>
			<div class="edit_panel_close">
				<button type="button" class="edit_panel_close_button special">
					<span class="material-symbols-rounded">
						add_circle
					</span>
					<h3>
						Task
					</h3>
				</button>
				<button type="button" class="edit_panel_close_button special">
					<span class="material-symbols-rounded">
						cancel
					</span>
					<h3>
						Close
					</h3>
				</button>
			</div>
			<div class="edit_panel_close">
				<button type="button" class="edit_panel_close_button_single error" onclick="deleteList()">
					<span class="material-symbols-rounded">
						delete
					</span>
					<h3>
						Delete List
					</h3>
				</button>
			</div>
		</div>
	`), editAttributes)
	// popup(``)
}

function popup(content) {
	let popop = elementFromHTML(`
		<div class="popup">
			<div class="popup_action">
				<button class="popup_action_close" onclick="() => {
						console.log('removing popup')
						document.querySelector('.popup').remove()
					}">
					<span class="material-symbols-rounded">
						delete
					</span>
					<h3>
						Discard
					</h3>
				</button>
			</div>
		</div>
	`)




	// let popup = document.querySelector("dialog.popup")
	// popup.showModal()
}

function elementFromHTML(html) {
    let template = document.createElement("template");
    template.innerHTML = html.trim();
    return template.content.firstElementChild
}