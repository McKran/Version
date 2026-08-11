const fs = require('fs');
fetch("http://localhost:3000/api/ph-crops")
  .then(res => res.json())
  .then(data => {
    console.log(data.slice(0, 5).map(c => c.id + " | " + c.cropName));
  })
