//App Settings
var AppSettings = {
	ListDirectory: "",
	APIPath: "http://localhost:8080",
	DeleteCompleted: false,
}

//List Data
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
	"note": null,
	"id": null
}

//List Attributes
var searchString = ""
var sortBy = localStorage.getItem("sortBy") || "3"
var filterBy = {
	TaskNum: {
		Min: 0,
		Max: null,
	},
	Importance: {
		Min: 1,
		Max: 5,
	},
	Completion: false
}

// https://zany-space-enigma-jv56wrqjjw4f4g6-8080.app.github.dev/ (when working on chromebook)
// http://localhost:8080 (when working anywhere else)

window.addEventListener("load", () => {
	if(JSON.parse(localStorage.getItem("AppSettings")) !== null) {
		AppSettings = JSON.parse(localStorage.getItem("AppSettings"))
		loadAppSettings()
		updateListDir()
	} else {
		loadAppSettings()
		updateListDir()
	}
	getLists()
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

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
	document.querySelector(`link[rel="manifest"]`).setAttribute("href", "/icons/favicon/darkmanifest.json")
} else {
	document.querySelector(`link[rel="manifest"]`).setAttribute("href", "/icons/favicon/lightmanifest.json")
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
	let newColorScheme = event.matches ? "dark" : "light"
	document.querySelector(`link[rel="manifest"]`).setAttribute("href", newColorScheme == "dark" ? "/icons/favicon/darkmanifest.json" : "/icons/favicon/lightmanifest.json")
})

function useLocalStorage() {
	if(localStorage.getItem("activeListID") != "" | null) {
		console.log("loading stored list")
		loadList(localStorage.getItem("activeListID"))
	}
}

function loadAppSettings() {
	let deletion = AppSettings.DeleteCompleted ? "check" : "close"
	let attributes = document.querySelector(".edit_panel_replaceable")
	attributes.parentNode.replaceChild(elementFromHTML(`
		<div class="edit_panel_replaceable">
			<div class="edit_panel_attributes">
				<h3 class="edit_panel_title">Application Settings:</h3>
				<div class="edit_panel_item">
					<h3 class="edit_panel_item_title">List Directory:</h3>
					<input type="text" class="edit_panel_item_value" name="listDirectory_input" value="${AppSettings.ListDirectory}" placeholder="List Directory Path" spellcheck="false" onchange="setListDir()">
				</div>
				<div class="edit_panel_item">
					<h3 class="edit_panel_item_title">API Path:</h3>
					<input type="text" class="edit_panel_item_value" name="APIPath_input" value="${AppSettings.APIPath}" placeholder="API Base URI" spellcheck="false" onchange="setAPIPath()">
				</div>
				<div class="edit_panel_item">
					<h3 class="edit_panel_item_title">Delete Completed Tasks:</h3>
					<button name="deleteCompletedTasks_checkbox" type="button" class="edit_panel_item_value" onclick="deleteCompletedTasks()">
						<span class="material-symbols-rounded">
							${deletion}
						</span>
					</button>
				</div>
			</div>
		</div>
	`), attributes)
}

function setListDir() {
	let input = document.querySelector(`input.edit_panel_item_value[name="listDirectory_input"]`)
	AppSettings.ListDirectory = input.value
	localStorage.setItem("AppSettings", JSON.stringify(AppSettings))
	console.log(JSON.parse(localStorage.getItem("AppSettings")))
	updateListDir()
}

function updateListDir() {
	console.log(`${AppSettings.APIPath}/?cmd=cslsdir&cmd=${AppSettings.ListDirectory}`)
	fetch(`${AppSettings.APIPath}/?cmd=cslsdir&cmd=${AppSettings.ListDirectory}`)
		.then((res) => {
			if(!res.ok) {
				throw new Error("Could not update List Directory")
			}
			return res.json()
		})
		.then((data) => {
			console.log(data)
		})
		.catch((err) => {
			console.error(err)
		})
}

function setAPIPath() {
	console.log("Old API Path: " + AppSettings.APIPath)
	let input = document.querySelector(`input.edit_panel_item_value[name="APIPath_input"]`)
	AppSettings.APIPath = input.value
	console.log("New API Path: " + AppSettings.APIPath)
	localStorage.setItem("AppSettings", JSON.stringify(AppSettings))
	console.log(JSON.parse(localStorage.getItem("AppSettings")))
}

function deleteCompletedTasks() {
	AppSettings.DeleteCompleted = !AppSettings.DeleteCompleted
	let checkbox = document.querySelector(`button.edit_panel_item_value[name="deleteCompletedTasks_checkbox"] > span`)
	checkbox.textContent = AppSettings.DeleteCompleted ? "check" : "close"
	localStorage.setItem("AppSettings", JSON.stringify(AppSettings))
	console.log(JSON.parse(localStorage.getItem("AppSettings")))
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
    fetch(`${AppSettings.APIPath}/?cmd=lsls`)
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
	console.log("Loading List with ID: " + id)
	if(id == null || id == "null") {
		console.log("List does not exist")
		return
	}

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

    fetch(`${AppSettings.APIPath}/?cmd=opls&cmd=${listName}`)
    	.then(res => {
        	if(!res.ok){
       		 	throw new Error();
        	}
        	return res.json();
        })
		.then(data => {
			activeList = data.data1
			console.log(activeList)
			localStorage.setItem("activeList", activeList)
            let listName = document.querySelector(".list_name")
            listName.textContent = activeList.name

            let taskContainer = document.querySelector(".list_data")
			if(taskContainer == null){
				taskContainer = document.querySelector(".list_replaceable")
				taskContainer.appendChild(elementFromHTML(`
					<div class="list_data">
					</div>	
				`))
			} else if(taskContainer != null) {
				taskContainer.parentNode.replaceChild(elementFromHTML(`
					<div class="list_data">
					</div>	
				`), taskContainer)
			}

			loadListAttributes()

			taskContainer = document.querySelector(".list_data")
			switch(sortBy) {
				case "1":
					break
				case "2":
					break
				case "3":
					console.log(activeList.tasks)
					for (let i = 0; i<activeList.tasks.length; i++) {
						console.log(i)
						loadListTask(activeList.tasks[i].name, i+1, activeList.tasks[i].severity, activeList.tasks[i].completionStatus, taskContainer)
					}
					break
				case "4":
					console.log(activeList.tasks)
					for (let i = activeList.tasks.length-1; i>=0; i--) {
						console.log(i)
						loadListTask(activeList.tasks[i].name, i+1, activeList.tasks[i].severity, activeList.tasks[i].completionStatus, taskContainer)
					}
					break
				case "5":
					break
				case "6":
					break
				case "7":
					break
				case "8":
					break
			}

            for (let i = 0; i<data.data1.tasks.length; i++) {
				loadListTask(activeList.tasks[i].name, i+1, activeList.tasks[i].severity, activeList.tasks[i].completionStatus, taskContainer)
            }
		})
}

function loadListTask(name, taskNum, severity, completionStatus, taskContainer) {
	let importance = ""
	// console.log("Task " + (i+1) + ": " + data.data1.tasks[i].severity)
	switch (severity) {
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
	let completionText = ""
	if(!completionStatus) {
		completionText = "No"
	} else {
		completionText = "Yes"
	}
	
    taskContainer.appendChild(elementFromHTML(`
		<button type="button" id="task-${name}" class="list_data_item" onclick='loadTask("task-${name}")'>
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
					<p class="list_data_item_completeion">${completionText}</p>
				</li>
			</ul>
    	</button>
    `))
}

function loadListAttributes() {
	let editAttributes = document.querySelector(".edit_panel_replaceable")
	editAttributes.parentNode.replaceChild(elementFromHTML(`
		<div class="edit_panel_replaceable">
			<div class="edit_panel_attributes">
				<h3 class="edit_panel_title">List Settings:</h3>
				<div class="edit_panel_item">
					<h3 class="edit_panel_item_title">List Name:</h3>
					<input type="text" class="edit_panel_item_value" placeholder="List Name" title="list_name_input" value="${activeList.name}">
				</div>
			</div>
			<div class="edit_panel_attributes">
				<h3 class="edit_panel_title">Display Options:</h3>
				<div class="edit_panel_item">
					<h3 class="edit_panel_item_title">Search Tasks:</h3>
					<input type="search" class="edit_panel_item_value" placeholder="Task Name" title="task_search_input" onclick="startSearchListener()" onchange="">
				</div>
				<div class="edit_panel_item">
					<h3 class="edit_panel_item_title">Sort By:</h3>
					<select class="edit_panel_item_value" title="task_importance_selector" onchange="sortAttributeChange()">
						<option value="1">Name: (A => Z)</option>
						<option value="2">Name: (Z => A)</option>
						<option value="3">Task #: (Low => High)</option>
						<option value="4">Task #: (High => Low)</option>
						<option value="5">Importance: (Very Low => Very High)</option>
						<option value="6">Importance: (Very High => Very Low)</option>
						<option value="7">Completion: (True => False)</option>
						<option value="8">Completion: (False => True)</option>
					</select>
				</div>
			</div>
			<div class="edit_panel_attributes">
				<h3 class="edit_panel_title">Filter By:</h3>
				<div class="edit_panel_item">
					<h3 class="edit_panel_item_title">Range of Task #'s:</h3>
					<div class="edit_panel_item_range">
						<input class="edit_panel_item_range_value" placeholder="Min" onchange="listFilter('tasknum')">
						<p>=></p>
						<input class="edit_panel_item_range_value" placeholder="Max" onchange="listFilter('tasknum')">
					</div>
				</div>
				<div class="edit_panel_item">
					<h3 class="edit_panel_item_title">Range of Importances:</h3>
					<div class="edit_panel_item_range">
						<select class="edit_panel_item_range_value" placeholder="Min" onchange="listFilter('importance')">
							<option value="1">Very low</option>
							<option value="2">Low</option>
							<option value="3">Medium</option>
							<option value="4">High</option>
							<option value="5">Very high</option>
						</select>
						<p>=></p>
						<select class="edit_panel_item_range_value" placeholder="Max" onchange="listFilter('importance')">
							<option value="1">Very low</option>
							<option value="2">Low</option>
							<option value="3">Medium</option>
							<option value="4">High</option>
							<option value="5">Very high</option>
						</select>
					</div>
				</div>
				<div class="edit_panel_item">
					<h3 class="edit_panel_item_title">Completion:</h3>
					<button name="list_completion_filter_checkbox" type="button" class="edit_panel_item_value" onclick="listFilter('completion')">
						<span class="material-symbols-rounded">
							close
						</span>
					</button>
				</div>
			</div>
			<div class="edit_panel_close">
				<button type="button" class="edit_panel_close_button special" onclick="createTask()">
					<span class="material-symbols-rounded">
						add_circle
					</span>
					<h3>
						Task
					</h3>
				</button>
				<button type="button" class="edit_panel_close_button special" onclick="closeList()">
					<span class="material-symbols-rounded">
						cancel
					</span>
					<h3>
						Close
					</h3>
				</button>
			</div>
			<div class="edit_panel_close">
				<button type="button" class="edit_panel_close_button_single edit_panel_close_button error" onclick="deleteList()">
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

	let selectedOption = document.querySelector(`.edit_panel_item_value > option[value="${sortBy}"]`)
	selectedOption.setAttribute('selected', 'true')
}

function createList() {
    // popup()
	console.log(localStorage.getItem("activeListID") !== null)
	if(localStorage.getItem("activeListID") === null){
		closeList()
	}
	let editAttributes = document.querySelector(".edit_panel_replaceable")
	editAttributes.parentNode.replaceChild(elementFromHTML(`
		<div class="edit_panel_replaceable">
			<div class="edit_panel_attributes">
				<h3 class="edit_panel_item_title">List Name:</h3>
				<div class="edit_panel_item">
					<h3 class="edit_panel_item_title">List Name:</h3>
					<input type="text" class="edit_panel_item_value" placeholder="List Name" title="list_name_input" value="">
				</div>
				<!-- <div class="edit_panel_item">
					<h3 class="edit_panel_item_title">Search Tasks:</h3>
					<input type="search" class="edit_panel_item_value" placeholder="Task Name" title="task_search_input" onclick="startSearchListener()" onchange="">
				</div>
				<div class="edit_panel_item">
					<h3 class="edit_panel_item_title">Sort By:</h3>
					<select class="edit_panel_item_value" title="task_importance_selector" onchange="importanceChanged()">
						<option value="1">Name</option>
						<option value="2" selected>Task #</option>
						<option value="3">Importance</option>
						<option value="4">Completion</option>
					</select>
				</div> -->
			</div>
			<div class="edit_panel_close">
				<button type="button" class="edit_panel_close_button special" onclick="confirmListCreate()">
					<span class="material-symbols-rounded">
						check
					</span>
					<h3>
						Finish
					</h3>
				</button>
				<button type="button" class="edit_panel_close_button error" onclick="cancelCreateList()">
					<span class="material-symbols-rounded">
						delete
					</span>
					<h3>
						Discard
					</h3>
				</button>
			</div>
		</div>
	`), editAttributes)
}

function cancelCreateList() {
	loadAppSettings()
}

function confirmListCreate() {
	let listName = document.querySelector(`.edit_panel_item_value[title="list_name_input"]`).value
	fetch(`${AppSettings.APIPath}?cmd=mkls&cmd=${listName}`)
		.then((res) => {
			if(!res.ok) {
				throw new Error("Could not create list")
			}
			return res.json()
		})
		.then((data) => {
			console.log(data)
		})
		.catch((err) => {
			console.error(err)
		})
}

function deleteList() {
	console.log("deleting list")

	let listData = document.querySelector(".list_replaceable")
	console.log(listData.classList[0])
	listData.parentNode.replaceChild(elementFromHTML(`
		<div class="list_replaceable">
		</div>
	`), listData)
	let listAttributes = document.querySelector(".edit_panel_replaceable")
	console.log(listAttributes.classList[0])
	listAttributes.parentNode.replaceChild(elementFromHTML(`
		<div class="edit_panel_replaceable">
		</div>
	`), listAttributes)
	fetch(`${AppSettings.APIPath}?cmd=dells&cmd=${activeFileName}`)
		.then((res) => {
			if(!res.ok) {
				throw new Error("Response not OK")
			}
			return res.json()
		})
		.then((data) => {
			console.log(data)
		})
}

function closeList() {
	document.querySelector(".list_replaceable").innerHTML = ""
	activeList = null
	localStorage.setItem("activeListID", null)
	document.querySelector(".list_menu_list_active").classList.remove("list_menu_list_active")
	loadAppSettings()
}

function startSearchListener() {
	let input = document.querySelector(`input.edit_panel_item_value[type="search"]`)
	// console.log(getEventListeners(input))
	input.removeEventListener("keydown", (e) => searchListener(e, input))
	input.addEventListener("keydown", (e) => searchListener(e, input))
}

function searchListener(e, input) {
	searchString = input.value
	console.log(searchString)
	if(e.key == "Enter"){
		input.removeEventListener("keydown", this)
	}
}

function setSearchString() {
	let input = document.querySelector(`input.edit_panel_item_value[type="search"]`)
	searchString = input.value
}

function sortAttributeChange() {
	let selector = document.querySelector(`[title="task_importance_selector"].edit_panel_item_value`)
	sortBy = selector.value
	// let options = selector.querySelectorAll("option")
	// options.forEach((option) => {
	// 	option.setAttribute("selected", "false")
	// })
	// console.log(sortBy)
	localStorage.setItem("sortBy", sortBy)
	// let option = selector.querySelector(`option[value="${sortBy}"]`)
	// option.setAttribute("selected", "true")
	
	loadList(localStorage.getItem("activeListID"))
}

function listFilter(str) {
	if(str == 'completion'){
		let checkbox = document.querySelector(`button[name="list_completion_filter_checkbox"] > span`)
		if(filterBy.Completion){
			filterBy.Completion = false
			checkbox.textContent = "close"
		} else {
			filterBy.Completion = true
			checkbox.textContent = "check"
		}
	}
}

function loadTask(id) {
	console.log("Loading Task with ID: " + id)
	if(id == null || id == "null") {
		console.log("Task does not exist")
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
	currentTask.note = activeList.tasks[currentTask.index].note
	console.log(currentTask.note)

	let completionStatus = "close"
	if(currentTask.completionStatus){
		completionStatus = "check"
	}

	localStorage.setItem("currentTask", currentTask)

	loadTaskAttributes()

	let selectedOption = document.querySelector(`.edit_panel_item_value > option[value="${currentTask.severity}"]`)
	selectedOption.setAttribute('selected', 'true')
}

function loadTaskAttributes() {
	let completionStatus = "close"
	if(currentTask.completionStatus) {
		completionStatus = "check"
	}
	console.log(currentTask.note)
	let editAttributes = document.querySelector(".edit_panel_replaceable")
	editAttributes.parentNode.replaceChild(elementFromHTML(`
		<div class="edit_panel_replaceable">
			<div class="edit_panel_attributes">
				<h3 class="edit_panel_title">Task Settings:</h3>
				<div class="edit_panel_item">
					<h3 class="edit_panel_item_title">Task Name:</h3>
					<input name="task_name_input" type="text" class="edit_panel_item_value" placeholder="Task Name" value="${currentTask.name}" onchange="taskNameChanged()" autocomplete="off" spellcheck="false">
				</div>
				<div class="edit_panel_item">
					<h3 class="edit_panel_item_title">Task Importance:</h3>
					<select name="task_importance_selector" class="edit_panel_item_value" onchange="taskImportanceChanged()">
						<option value="1">Very low</option>
						<option value="2">Low</option>
						<option value="3">Medium</option>
						<option value="4">High</option>
						<option value="5">Very high</option>
					</select>
				</div>
				<div class="edit_panel_item">
					<h3 class="edit_panel_item_title">Task Completed?:</h3>
					<button name="task_completionStatus_checkbox" type="button" class="edit_panel_item_value" onclick="taskCompletionChanged()">
						<span class="material-symbols-rounded">
							${completionStatus}
						</span>
					</button>
				</div>
				<div class="edit_panel_item">
					<h3 class="edit_panel_item_title">Notes:</h3>
					<textarea autocomplete="off" class="edit_panel_item_value" label="notes_edit_input" placeholder="Notes" onchange="taskNotesChanged()" value="">${currentTask.note}</textarea>
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
				<button type="button" class="edit_panel_close_button edit_panel_close_button_single error" onclick="deleteTask()">
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
}

function taskNameChanged() {
	let name = document.querySelector(`input.edit_panel_item_value`)
	currentTask.name = name.value
	if(currentTask.name != activeList.tasks[currentTask.index].name){
		name.classList.add("edit_panel_item_value_changed")
	} else {
		name.classList.remove("edit_panel_item_value_changed")
	}
}

function taskImportanceChanged() {
	console.log(activeList.tasks[currentTask.index]) 
	let selector = document.querySelector(`select.edit_panel_item_value`)
	currentTask.severity = selector.value
	if(currentTask.severity != activeList.tasks[currentTask.index].severity){
		selector.classList.add("edit_panel_item_value_changed")
	} else {
		selector.classList.remove("edit_panel_item_value_changed")
	}
}

function taskCompletionChanged() {
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

function taskNotesChanged(){
	let note = document.querySelector(`textarea.edit_panel_item_value`)
	currentTask.note = note.value
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

	fetch(`${AppSettings.APIPath}?cmd=edls&cmd=task&cmd=${name}&cmd=${severity}&cmd=${completionStatus}&cmd=${note}&cmd=${index}&cmd=${activeFileName}`)
		.then(res => {
			if(!res.ok) {
				throw new Error
			}
			return res.json()
		})
		.then(data => {
			activeList = data.data1
			closeTaskEdit()
		})
}

function closeTaskEdit() {
	let changedItems = document.querySelectorAll(".edit_panel_item_value_changed")
	changedItems.forEach((element) => {console.log(element.name)})
	if(true){
		document.querySelector(`.list_data_item_active`).classList.remove("list_data_item_active")
		currentTask = {
			name: null,
			severity: null,
			completionStatus: null,
			id: null
		}
		
		localStorage.setItem("activeTaskID", null)
	}
	
	loadListAttributes()
	// popup(``)
}

function createTask() {
	let editAttributes = document.querySelector(".edit_panel_replaceable")
	editAttributes.parentNode.replaceChild(elementFromHTML(`
		<div class="edit_panel_replaceable">
			<div class="edit_panel_attributes">
				<h3 class="edit_panel_item_title">Task Name:</h3>
				<div class="edit_panel_item">
					<h3 class="edit_panel_item_title">Task Name:</h3>
					<input name="task_name_input" type="text" class="edit_panel_item_value" placeholder="Task Name" value="" autocomplete="off" spellcheck="false">
				</div>
				<div class="edit_panel_item">
					<h3 class="edit_panel_item_title">Task Importance:</h3>
					<select name="task_importance_selector" class="edit_panel_item_value">
						<option value="1">Very low</option>
						<option value="2">Low</option>
						<option value="3" selected>Medium</option>
						<option value="4">High</option>
						<option value="5">Very high</option>
					</select>
				</div>
				<div class="edit_panel_item">
					<h3 class="edit_panel_item_title">Notes:</h3>
					<textarea autocomplete="off" class="edit_panel_item_value" label="notes_edit_input" placeholder="Notes"></textarea>
				</div>
			</div>
			<div class="edit_panel_close">
				<button type="button" class="edit_panel_close_button special" onclick="confirmTaskCreate()">
					<span class="material-symbols-rounded">
						check
					</span>
					<h3>
						Finish
					</h3>
				</button>
				<button type="button" class="edit_panel_close_button error" onclick="discardTaskCreate()">
					<span class="material-symbols-rounded">
						delete
					</span>
					<h3>
						Discard
					</h3>
				</button>
			</div>
		</div>
	`), editAttributes)
}

function confirmTaskCreate() {
	let name = document.querySelector(`input.edit_panel_item_value[name="task_name_input"]`).value.replace(/["'`]+/g, "")
	let severity = document.querySelector(`select.edit_panel_item_value[name="task_importance_selector"]`).value
	let note = document.querySelector(`textarea.edit_panel_item_value`).value
	console.log("Task Name: " + name)
	console.log("Task Severity: " + severity)
	console.log("Task Note: " + note)
	fetch(`${AppSettings.APIPath}?cmd=mktk&cmd=${name}&cmd=${severity}&cmd=${note}`)
		.then((res) => {
			if(!res.ok) {
				throw new Error("Could not create new task")
			}
			return res.json()
		})
		.then((data) => {
			console.log(data)
			loadList("list-" + activeFileName)
		})
		.catch((err) => {
			console.error(err)
		})
}

function discardTaskCreate() {
	loadListAttributes()
}

function deleteTask() {
	let task = document.querySelector(".list_data_item_active")
	let taskName = task.id.substring(5)
	fetch(`${AppSettings.APIPath}?cmd=deltk&cmd=${taskName}`)
		.then((res) => {
			if(!res.ok){
				throw new Error("Could not delete task properly")
			}
			return res.json()
		})
		.then((data) => {
			console.log("Task Deleted: " + data.data2.name)

			let changedItems = document.querySelectorAll(".edit_panel_item_value_changed")
			changedItems.forEach((element) => {console.log(element.name)})
			document.querySelector(`.list_data_item_active`).classList.remove("list_data_item_active")
			currentTask = {
				name: null,
				severity: null,
				completionStatus: null,
				id: null
			}
			localStorage.setItem("activeTaskID", null)
			loadListAttributes()
			loadList("list-" + activeFileName)
		})
		.catch((err) => {
			console.log(err)
		})
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

//extra ideas for other features
// create a reecurant task system (when marked as completed it creates a copy of itself for after a certain timeframe)
// add duedate value to tasks
// light / dark mode switching capabilites
