package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"github.com/LikeMyGames/Task-Tracker/API/TaskManager"
)

func main() {
	config := TaskManager.Config{
		ListDirectory:          "G:/Projects/VSCode/Task Tracker/Lists/",
		FileNameSameAsListName: true,
		DeleteCompletedTasks:   true,
		SortAttribute:          "task #",
	}
	dir, _ := TaskManager.RunCommand(config, []string{"wd"}...)
	log.Println(dir)
	dirStr := dir.(string)
	log.Println(dirStr)
	// log.Println(dirStr)
	if strings.Contains(dirStr, "API/") {
		dirStr = strings.Trim(dirStr, "API/")
		config.ListDirectory = dirStr + "Lists/"
	} else if strings.Contains(dirStr, "API") {
		dirStr = strings.Trim(dirStr, "API")
		config.ListDirectory = dirStr + "Lists/"
	} else {
		config.ListDirectory = dirStr + "/"
	}
	log.Println(dirStr)
	log.Println("List Directory:\t" + config.ListDirectory)

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
		if cmd[0] == "cdlsdir" {
			config.ListDirectory = cmd[1]
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
