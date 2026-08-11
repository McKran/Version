(async () => {
  const res = await fetch("http://localhost:3000/api/chat/conversations", {
    method: "POST", headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ title: "Test" })
  });
  console.log(res.status, await res.text());
})();
