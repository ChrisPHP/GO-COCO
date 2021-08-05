package Annotation

type Object struct {
  Id int
  Image_id int
  Category_id int
  Segmentation int
  area float
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

func FormatObjects(w http.ResponseWriter, r *http.Request) {

}
