package Annotation

import (
  "net/http"
  "fmt"
  "encoding/json"
)

type Unformat struct {
  Segmentation [][]int
  Bbox [][]int
  Area [][]int
}


type Object struct {
  Id int
  Image_id int
  Category_id int
  Segmentation []int
  area float64
  Bbox []Bbox
  iscrowd int
}

type Bbox struct {
  X int
  Y int
  Width int
  Height int
}

type Categories struct {
  Id int
  name string
  supercategory string
}

func CheckErrorMarshal(w http.ResponseWriter, r *http.Request, err error, b []byte) {
  if (err != nil) {
    fmt.Println(err)
    http.Error(w, err.Error(), http.StatusInternalServerError)
  } else {
    w.Write(b)
  }
  return
}


func FormatObjects(w http.ResponseWriter, r *http.Request) {
  w.Header().Set("Content-Type", "application/json")

  var O Unformat

  err := json.NewDecoder(r.Body).Decode(&O)
  if (err != nil) {
    fmt.Println(err)
  }

  var Obj Object

  for i, s := range O.Segmentation {
    Obj.Segmentation = s
  }

  fmt.Println(Obj)

  b, err := json.Marshal(O)
  CheckErrorMarshal(w, r, err, b)
}
