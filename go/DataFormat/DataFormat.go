package DataFormat

import (
  "net/http"
  "fmt"
  "encoding/json"
  "image"
  _ "image/jpeg"
  _ "image/png"
)

type Info struct {
  Year string
  Version string
  Descrption string
  Contributor string
  Url string
  Date_created string
}

type Image struct {
  Id int
  Width int
  Height int
  File_name string
  License int
  Coco_url string
  Date_captured string
}

type Licenses struct {
  Id int
  Name string
  Url string
}

type Data struct {
  Info []Info
  Image []Image
  Licenses []Licenses
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

//Create a placeholder json
func PlaceholderCreate(w http.ResponseWriter, r *http.Request) {
  w.Header().Set("Content-Type", "application/json")

  L := Licenses{0, "Placeholder License", "N/A"}
  b, err := json.Marshal(L)
  CheckErrorMarshal(w, r, err, b)
}

//Create Licenses and Info JSON format
func Initialized(w http.ResponseWriter, r *http.Request) {
  w.Header().Set("Content-Type", "application/json")

  var D Data

  err := json.NewDecoder(r.Body).Decode(&D)
  if (err != nil) {
    fmt.Println(err)
  }

  b, err := json.Marshal(D)
  CheckErrorMarshal(w, r, err, b)
}

func FormatImages(w http.ResponseWriter, r *http.Request) {
  w.Header().Set("Content-Type", "application/json")

  var D Data

  err := json.NewDecoder(r.Body).Decode(&D)
  if (err != nil) {
    fmt.Println(err)
  }

  b, err := json.Marshal(D)
  CheckErrorMarshal(w, r, err, b)
}

//Convert uploaded images with multipart
func UploadImages(w http.ResponseWriter, r *http.Request) {
  r.ParseMultipartForm(32 << 20)
  files := r.MultipartForm.File["Images"]

  var I []Image

  //get each uploaded file info
  for i, handler := range files {
    file, err := handler.Open()
    if (err != nil) {
      fmt.Println(err)
    }
    defer file.Close()

    //Decode the image to get details of it's height and width
    image, _, err := image.DecodeConfig(file)
    if (err != nil) {
      fmt.Println(err)
    }
    //add info to strucrt.

    I = append(I, Image{Id: i, Width: image.Width, Height: image.Height, File_name: handler.Filename, License: 0, Coco_url: "n/a", Date_captured: "0"})
  }
  b, err := json.Marshal(I)
  fmt.Println(string(b))
  CheckErrorMarshal(w, r, err, b)
}
