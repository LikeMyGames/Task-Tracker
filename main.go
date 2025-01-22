package main

import (
	"Go-GTK3-Test/TaskManager"
	"encoding/json"
	"log"
	"net/http"
)

func main() {
	config := TaskManager.Config{
		ListDirectory:          "G:/Projects/VSCode/TaskManagerWithGUI/Lists/",
		FileNameSameAsListName: true,
		DeleteCompletedTasks:   true,
		SortAttribute:          "task #",
	}
	dir, _ := TaskManager.RunCommand(config, []string{"wd"}...)
	config.ListDirectory = dir.(string) + "/Lists/"
	log.Println(config.ListDirectory)

	// Hello world, the web server
	handler := func(w http.ResponseWriter, req *http.Request) {
		queryParams := req.URL.Query()
		cmd := queryParams["cmd"]

		log.Println("\"cmd\" URL query value: ", cmd)
		if len(cmd) == 0 {
			help, _ := TaskManager.RunCommand(config, []string{"help"}...)
			jsonHelp, err := json.Marshal(help)
			if err != nil {
				log.Fatal(err)
				return
			}
			w.Write([]byte(jsonHelp))
			return
		}
		data, data2 := TaskManager.RunCommand(config, cmd...)
		log.Println("data1: ", data)
		log.Println("data2: ", data2)

		jsonData, err := json.Marshal(data)
		if err != nil {
			log.Fatal(err)
			return
		}

		jsonData2, err := json.Marshal(data2)
		if err != nil {
			log.Fatal(err)
			return
		}

		sendData := append([]byte("{\"data1\":"), append(jsonData, append([]byte(",\"data2\":"), append(jsonData2, []byte("}")...)...)...)...)

		w.Header().Add("Access-Control-Allow-Origin", "*")
		w.Header().Add("Content-Type", "application/json")
		w.Write(sendData)
		// command := strings.Split(req.URL.Path, "/")
		// for i, n := range command {
		// 	if n == "\n" || n == "" {
		// 		command = append(command[:i], command[i+1:]...)
		// 	}
		// }
		// // log.Println(command)
		// // time.Sleep(1000 * time.Millisecond)
		// data1, data2 := TaskManager.RunCommand(config, command...)
		// switch data1 := data1.(type) {
		// case string:
		// 	jsonData, err := json.Marshal(data1)
		// 	if err != nil {
		// 		log.Fatal(err)
		// 		return
		// 	}
		// 	w.Write(jsonData)
		// 	http.Request
		// case TaskManager.Task:

		// case TaskManager.TaskList:

		// }
		// switch data2.(type) {
		// case string:

		// case TaskManager.Task:

		// case TaskManager.TaskList:

		// }
		// log.Println(returnData)
		// log.Println(returnData.(TaskManager.TaskList))
		// log.Println(TaskManager.Printls(returnData.(TaskManager.TaskList)))
		// str := TaskManager.Printls((returnData.(TaskManager.TaskList)))
		// io.WriteString(w, dataType)
	}

	http.HandleFunc("/", handler)
	log.Println("Starting server on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
