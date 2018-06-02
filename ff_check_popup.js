document.addEventListener("DOMContentLoaded", function() {
	let body = document.getElementById("body");
	let inp = document.createElement("input");
	inp.type = "file";
	inp.accept = "txt";
	inp.style.display = "none";
	body.appendChild(inp);
	setTimeout(function() {
		inp.click();
	}, 10);
});
