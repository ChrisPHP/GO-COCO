package main

import (
  "net/http"
  "fmt"

  "github.com/ChrisPHP/GO-COCO/DataFormat"
)

func setupRoutes() {
  fileServer := http.FileServer(http.Dir("../web"))
  http.Handle("/", fileServer)
  http.HandleFunc("/Intial", DataFormat.Initialized)
  http.HandleFunc("/Images", DataFormat.UploadImages)
  http.HandleFunc("/Placeholder", DataFormat.PlaceholderCreate)

  if err := http.ListenAndServe(":8000", nil); err != nil {
    fmt.Println(err)
  }
}

func main() {
  setupRoutes()
}
