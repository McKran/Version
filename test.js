fetch("http://localhost:3000/api/ph-crops")
  .then(res => res.json())
  .then(data => console.log(JSON.stringify(data.slice(0,3), null, 2)))
  .catch(console.error);
