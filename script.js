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
	"index": null
}

document.addEventListener("DOMContentLoaded", function() {
    // Your function code here
    // getLists();
});

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
            console.log(data.data1)
			let listContainer = document.querySelector(".list_menu_lists")
            for (let i = 0; i<data.data1.length; i++) {
                listContainer.appendChild(elementFromHTML(`
                    <button title="${data.data1[i]}" type="button" id="list-${data.data1[i]}" class="list_menu_list" onclick="loadList(this.id)">
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

    let button = document.querySelector(`.list_menu_list#${id}`)
    button.classList.add("list_menu_list_active")

    let listName = button.title
	activeFileName = listName
	localStorage.setItem("activeFileName", activeFileName)

    fetch(`http://127.0.0.1:8080/?cmd=opls&cmd=${listName}`)
    	.then(res => {
        	if(!res.ok){
       		 	throw new Error();
        	}
        	return res.json();
        })
		.then(data => {
            console.log(data.data1)
			activeList = data.data1
			localStorage.setItem("activeList", activeList)
            let listName = document.querySelector(".list_name")
            listName.textContent = data.data1.name

            let taskContainer = document.querySelector(".list_data")
            for (let i = 0; i<data.data1.tasks.length; i++) {
				let name = data.data1.tasks[i].name
				let taskNum = i+1
				let importance = ""
				console.log("Task " + (i+1) + ": " + data.data1.tasks[i].severity)
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
					<button type="button" title="${name}" id="task-${name}" class="list_data_item" onclick="loadTask(this.title)">
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
    alert("need to make this function")
}

function loadTask(title) {
    let buttons = document.querySelectorAll(`.list_data_item`)
    buttons.forEach(button => {
        button.classList.remove("list_data_item_active")
    });

    let button = document.querySelector(`[title="${title}"]`)
	console.log(title)
    button.classList.add("list_data_item_active")

	currentTask.index = button.querySelector(".list_data_item_task_num").textContent - 1
	console.log("current task " + currentTask.index)
	currentTask.name =  activeList.tasks[currentTask.index].name
	currentTask.severity = activeList.tasks[currentTask.index].severity
	currentTask.completionStatus = activeList.tasks[currentTask.index].completionStatus

	localStorage.setItem("currentTask", currentTask)

	let editAttributes = document.querySelector(".edit_panel_attributes")
	editAttributes.innerHTML = ""
	editAttributes.appendChild(elementFromHTML(`
		<div>
			<div class="edit_panel_item">
				<h3 class="edit_panel_item_title">Name:</h3>
				<input type="text" class="edit_panel_item_value" label="name_edit_input" placeholder="Name" value="${currentTask.name}" onchange="nameChanged()">
			</div>
			<div class="edit_panel_item">
				<h3 class="edit_panel_item_title">Importance</h3>
				<select name="task_importance_selector" class="edit_panel_item_value" title="importance_selector" onchange="importanceChanged()">
					<option value="1">Very low</option>
					<option value="2">Low</option>
					<option value="3">Medium</option>
					<option value="4">High</option>
					<option value="5">Very high</option>
				</select>
			</div>
			<div class="edit_panel_item">
				<h3 class="edit_panel_item_title">Completed?:</h3>
				<button type="button" class="edit_panel_item_value" onclick="completionChanged()">
					<span class="material-symbols-rounded edit_panel_item_value_icon">
						close
					</span>
				</button>
			</div>
			<div class="edit_panel_item">
				<h3 class="edit_panel_item_title">Notes:</h3>
				<textarea spellcheck="false" autocomplete="off" class="edit_panel_item_value" label="notes_edit_input" placeholder="Notes"></textarea>
			</div>
		</div
	`))
	editAttributes.querySelector(`option[value="${currentTask.severity}"]`).setAttribute('selected', 'true')
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
	let check = document.querySelector(".edit_panel_item_value_icon")

	if(currentTask.completionStatus != activeList.tasks[currentTask.index].completionStatus) {
		checkbox.classList.add("edit_panel_item_value_changed")
	} else {
		checkbox.classList.remove("edit_panel_item_value_changed")
	}

	if(currentTask.completionStatus) {
		check.innerHTML = "check"
	} else {
		check.innerHTML = "close"
	}
}

function notesChanged(){
	console.log("need to add this function")
}

function closeTaskEdit(e) {
	e.preventDefault()
	let name = currentTask.name
	let severity = currentTask.severity
	let completionStatus = currentTask.completionStatus
	let index = currentTask.index
	console.log("name: " + name)
	console.log("severity: " + severity)
	console.log("completionStatus: " + completionStatus)
	console.log("index: " + index)

	fetch(`http://127.0.0.1:8080?cmd=edls&cmd=task&cmd=${name}&cmd=${severity}&cmd=${completionStatus}&cmd=${index}&cmd=${activeFileName}`, {
		method: 'GET',
	})
	setTimeout(() => {console.log("hello")}, 3000)
		// .then(res => {

		// 	console.log(res)
		// 	// if(!res.ok) {
		// 	// 	throw new Error
		// 	// }
		// 	// return res.json()
		// })
		// .then(data => {
		// 	activeList = data.data1
		// })
}

function elementFromHTML(html) {
    let template = document.createElement("template");
    template.innerHTML = html.trim();
    return template.content.firstElementChild
}