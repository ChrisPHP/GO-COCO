var BoxOn = true;
var PointsOn = false;

var Drag = false;

var Classes = [];

//Save Polygons
var Seg = [];

//format for golang to merge
var Poly = [];
var Area = [];
var BBox = [];

window.onload = function(e) {
  var CreateInfo = document.getElementById('CreateInfo');
  var disp = document.getElementById("jsresponse");


  //Load image from user
  var imageInput = document.getElementById('imageInput');
  imageInput.addEventListener('change', function(e) {
    if (e.target.files) {
      let imageFile = e.target.files[0];
      var reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onloadend = function(e) {
        var myImage = new Image();
        myImage.src = e.target.result;
        myImage.onload = function(ev) {
          var myCanvas = document.getElementById("ImgLayer");
          var myContext = myCanvas.getContext("2d");
          myContext.drawImage(myImage,0,0, myImage.width, myImage.height, 0, 0, myCanvas.width, myCanvas.height);
          let imgData = myCanvas.toDataURL("image/jpeg",0.75)
        }
      }
    }
  });

  //=======================
  //Add Classes and colours
  //=======================

  var CategoryText = document.getElementById("CategoryName");
  var AddClass = document.getElementById("ClassAddButton");
  var ClassColour = document.getElementById("ClassColour");
  var ClassList = document.getElementById("ClassList");

  AddClass.addEventListener("click", function(e) {
    if (CategoryText.value == "") {
      alert("Class Name needed");
      return;
    } else {
      Classes.push([CategoryText.value, ClassColour.value])

      var select = document.getElementById("ClassList");
      var option = document.createElement("option");

      option.value = Classes.length
      option.text = CategoryText.value;
      select.add(option, Classes.length);

      //document.getElementById("ClassCol").style.backgroundColor = ClassColour.value;
    }
  });

  var RemClass = document.getElementById("RemClass");

  RemClass.addEventListener("click", function(e){
    HexToRGB(Classes[ClassList.value - 1][1])
  });


  ClassList.addEventListener("change", function(e) {
    //console.log(Classes[ClassList.value - 1]);
    document.getElementById("ClassCol").style.backgroundColor = Classes[ClassList.value - 1][1]
  });

  //===================================
  //Editing the Canvas like clearing
  //===================================

  var ClearCanvas = document.getElementById("ClearCanvas");

  ClearCanvas.addEventListener("click", function(e) {
    DrawCtx.clearRect(0, 0, DrawLayer.width, DrawLayer.height);
  });


  //===================================
  //Tools for annotating
  //===================================

  var Box = document.getElementById("BoxButton");
  var Points = document.getElementById("PointsButton");

  //Check if button is selected
  Box.addEventListener("click", function(e) {
    CheckIfAactive(0);
  });
  Points.addEventListener("click", function(e) {
    CheckIfAactive(1);
  });

  //Mouseover canvas for X and Y coordinates
  var DrawLayer = document.getElementById("DrawLayer");
  var DrawCtx = DrawLayer.getContext("2d");

  var TempLayer = document.getElementById("TempLayer");
  var TempCtx = TempLayer.getContext("2d");

  DrawLayer.addEventListener("mousemove", function(e) {
    var cRect = TempLayer.getBoundingClientRect();
    var offsetX = cRect.left;
    var offsetY = cRect.top;

    var cX = Math.round(e.clientX - offsetX);
    var cY = Math.round(e.clientY - offsetY);
  });

  //=========================================
  //Function and arrays to draw on the canvas
  //=========================================
  var PointXY = [];
  var FirstPoint = true;

  var startX;
  var startY;

  var cRect = TempLayer.getBoundingClientRect();
  var offsetX = cRect.left;
  var offsetY = cRect.top;

  DrawLayer.addEventListener("mouseup", function(e) {
    Drag = false;

    if (BoxOn == true) {
      mouseX = Math.round(e.clientX - offsetX);
      mouseY = Math.round(e.clientY - offsetY);

      var Width = mouseX - StartX;
      var Height = mouseY - StartY;

      TempCtx.clearRect(0, 0, TempLayer.width, TempLayer.height);
      DrawCtx.strokeRect(StartX, StartY, Width, Height);
    }
  });

  DrawLayer.addEventListener("mousedown", function(e) {

    var cX = Math.round(e.clientX - offsetX);
    var cY = Math.round(e.clientY - offsetY);

    if (PointsOn == true) {
      //Draw polygons with points
      TempCtx.beginPath();
      TempCtx.arc(cX, cY, 5, 0, 2 * Math.PI, false);
      TempCtx.fillStyle = "#000000";
      TempCtx.fill();
      TempCtx.lineWidth = 0;
      TempCtx.strokeStyle = "#000000";
      TempCtx.stroke();

      if (FirstPoint == true) {
        PointXY.push([cX, cY]);
        FirstPoint = false;
      } else {
        if (FindPoint(PointXY[0][0], PointXY[0][1], cX, cY) == false) {
          PointXY.push([cX, cY]);
          TempCtx.beginPath();
          TempCtx.moveTo(PointXY[PointXY.length-2][0], PointXY[PointXY.length-2][1]);
          TempCtx.lineTo(PointXY[PointXY.length-1][0], PointXY[PointXY.length-1][1])
          TempCtx.stroke();
        } else {
          TempCtx.clearRect(0, 0, DrawLayer.width, DrawLayer.height);
          FinishPoly(PointXY)
          PointXY = [];
          FirstPoint = true;
        }
      }
    } else if (BoxOn == true) {
      Drag = true;
      StartX = cX;
      StartY = cY;
    }
  });

  DrawLayer.addEventListener("mousemove", function(e) {
    if (Drag == true) {
      mouseX = Math.round(e.clientX - offsetX);
      mouseY = Math.round(e.clientY - offsetY);

      var Width = mouseX - StartX;
      var Height = mouseY - StartY;

      TempCtx.clearRect(0, 0, TempLayer.width, TempLayer.height);
      TempCtx.strokeRect(StartX, StartY, Width, Height);
    }
  });
}

//=======================
//End of Onload function
//=======================

//Convert hex to RGB
function HexToRGB(hex) {
  //remove # at start of string
  hex = hex.substring(1);
  //Split hex into 3 pairs
  var x = hex.match(/.{1,2}/g);

  var RGBA = [
    parseInt(x[0], 16),
    parseInt(x[1], 16),
    parseInt(x[2], 16)
  ]


  return 'rgb(' + RGBA[0] + ',' + RGBA[1] + ',' + RGBA[2] + ', 0.5' + ')';
}

function FindPoint(PX, PY, CX, CY) {
  x1 = PX - 10;
  x2 = PX + 10;
  y1 = PY - 10;
  y2 = PY + 10;

  if (CX > x1 && CX < x2 && CY > y1 && CY < y2) {
    console.log("true");
    return true
  } else {
    console.log("false");
    return false
  }
}


function FinishPoly(PointXY) {
  var SelClass = document.getElementById("ClassList");
  var DrawLayer = document.getElementById("DrawLayer");
  var DrawCtx = DrawLayer.getContext("2d");

  DrawCtx.beginPath();
  DrawCtx.moveTo(PointXY[0][0], PointXY[0][1]);
  for (var i = 1; i < PointXY.length; i++) {
    DrawCtx.lineTo(PointXY[i][0], PointXY[i][1])
    Seg.push(PointXY[i][0], PointXY[i][1])
  }
  console.log(HexToRGB(Classes[SelClass.value - 1][1]))
  DrawCtx.closePath();
  DrawCtx.fillStyle = HexToRGB(Classes[SelClass.value - 1][1]);
  DrawCtx.fill();
  BBox(Seg)
}

function BBox(Points) {
  var MinX = Number.MAX_VALUE;
  var MaxX = Number.MIN_VALUE;
  var MinY = Number.MAX_VALUE;
  var MaxY = Number.MIN_VALUE;


  for (var i = 0; i < Points.length; i += 2) {
    var x = Points[i];
    var y = Points[i + 1];
    //console.log(y)
    MinX = Math.min(MinX, x);
    MaxX = Math.max(MaxX, x);
    MinY = Math.min(MinY, y);
    MaxY = Math.max(MaxY, y);
    //var width = MaxX - MinX;
  }

  var DrawLayer = document.getElementById("DrawLayer")
  var DrawCtx = DrawLayer.getContext("2d");

  DrawCtx.beginPath();
  DrawCtx.rect(MinX, MinY, MaxX - MinX, MaxY - MinY);
  DrawCtx.stroke();

  //console.log(width)
}

//check active buttons
function CheckIfAactive(item) {
  switch (item) {
    case 0:
      if (BoxOn == false) {
        BoxOn = true;
        PointsOn = false;
      } else {
        BoxOn = false;
      }
      ChangeHighlight(0);
      break;
    case 1:
      if (PointsOn == false) {
        PointsOn = true;
        BoxOn = false;
      } else {
        PointsOn = false;
      }
      ChangeHighlight(1);
      break;
  }
}

function ChangeHighlight(elem) {
  var Box = document.getElementById("BoxButton");
  var Points = document.getElementById("PointsButton");

  switch (elem) {
    case 0:
      if (BoxOn == false) {
        Box.className = "btn btn-secondary";
      } else {
        Points.className = "btn btn-secondary";
        Box.className = "btn btn-primary";
      }
      break;
    case 1:
    if (PointsOn == false) {
      Points.className = "btn btn-secondary";
    } else {
      Points.className = "btn btn-primary";
      Box.className = "btn btn-secondary";
    }
      break;
  }
}

function PlaceMe() {
  fetch("http://localhost:8000/Placeholder")
    .then(response => response.json())
    .then(data => {
      console.log(data);
      disp.innerHTML = JSON.stringify(data);
    })
}

function ImageMe() {
     fetch("http://localhost:8000/Images", {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify(Image),
     })
        .then(response => response.json())
        .then(data => {
          console.log(data);
          disp.innerHTML = JSON.stringify(data);
        })
        .catch((error) => {
          console.error('Error', error);
        });
}

function fetchMe() {

  const Info = {"Info": [{"Year": "2021", "Version": "n/a", "Descrption": "COCO made with go", "Contributor": "n/a", "Url": "n/a", "Date_created": "17/07/2021"}],
                "Licenses": [{"Id": 0, "Name": "MIT", "Url": "https://opensource.org/licenses/MIT"}]};

  fetch("http://localhost:8000/Intial", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(Info),
  })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      disp.innerHTML = JSON.stringify(data);
    })
    .catch((error) => {
      console.error('Error', error);
    })
}
